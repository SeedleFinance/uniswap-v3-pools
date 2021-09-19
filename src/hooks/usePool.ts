import { useState, useEffect } from "react";
import { compact, isEqualWith } from "lodash";
import { Position, Pool } from "@uniswap/v3-sdk";
import { Contract } from "@ethersproject/contracts";
import { Token, Price, CurrencyAmount } from "@uniswap/sdk-core";
import { BigNumber } from "@ethersproject/bignumber";
import { useWeb3React } from "@web3-react/core";

import { usePoolContract } from "./useContract";
import { PositionState } from "./usePosition";

export interface PoolState {
  key: string;
  address: string;
  quoteToken: Token;
  baseToken: Token;
  entity: Pool;
  poolLiquidity: CurrencyAmount<Token>;
  rawPoolLiquidity: BigNumber;
  poolUncollectedFees: CurrencyAmount<Token>;
  positions: {
    id: BigNumber;
    entity: Position;
    priceLower?: Price<Token, Token>;
    priceUpper?: Price<Token, Token>;
    positionLiquidity?: CurrencyAmount<Token>;
    uncollectedFees: CurrencyAmount<Token>[];
    positionUncollectedFees: CurrencyAmount<Token>;
  }[];
}

export function usePool(
  token0: Token | null,
  token1: Token | null,
  fee: number
): {
  pool: Pool | null;
  poolAddress: string | null;
} {
  const contract = usePoolContract(token0, token1, fee);

  const [pool, setPool] = useState<Pool | null>(null);
  const [poolAddress, setPoolAddress] = useState<string | null>(null);

  useEffect(() => {
    const call = async () => {
      if (!contract) {
        return;
      }

      setPoolAddress(contract.address.toLowerCase());

      const result = await contract.functions.slot0();
      const sqrtPriceX96 = result[0];
      const tickCurrent = result[1];

      const liquidityResult = await contract.functions.liquidity();
      const liquidity = liquidityResult[0];

      setPool(
        new Pool(
          token0 as Token,
          token1 as Token,
          fee,
          sqrtPriceX96,
          liquidity,
          tickCurrent
        )
      );
    };

    call();
  }, [contract, token0, token1, fee]);

  return { pool, poolAddress };
}

export function usePoolsState(
  contracts: (Contract | null)[],
  params: any[],
  positionsByPool: { [key: string]: any }
) {
  const { chainId } = useWeb3React();
  const [pools, setPools] = useState<PoolState[]>([]);

  useEffect(() => {
    if (
      !params.length ||
      !contracts.length ||
      !positionsByPool ||
      !Object.keys(positionsByPool).length
    ) {
      return;
    }

    const enhancePositions = (
      pool: Pool,
      baseToken: Token,
      positions: PositionState[]
    ) => {
      let rawPoolLiquidity = BigNumber.from(0);
      let poolLiquidity = CurrencyAmount.fromRawAmount(baseToken, 0);
      let poolUncollectedFees = CurrencyAmount.fromRawAmount(baseToken, 0);

      const enhanced = positions.map(
        ({ id, liquidity, tickLower, tickUpper, fees }: PositionState) => {
          const entity = new Position({
            pool,
            liquidity: liquidity.toString(),
            tickLower,
            tickUpper,
          });

          const uncollectedFees = [
            CurrencyAmount.fromRawAmount(pool.token0, fees.amount0.toString()),
            CurrencyAmount.fromRawAmount(pool.token1, fees.amount1.toString()),
          ];

          // liquidity of the position in quote token
          const positionLiquidity = pool.token0.equals(baseToken)
            ? pool
                .priceOf(pool.token1)
                .quote(entity.amount1)
                .add(entity.amount0)
            : pool
                .priceOf(pool.token0)
                .quote(entity.amount0)
                .add(entity.amount1);

          const positionUncollectedFees = pool.token0.equals(baseToken)
            ? pool
                .priceOf(pool.token1)
                .quote(uncollectedFees[1])
                .add(uncollectedFees[0])
            : pool
                .priceOf(pool.token0)
                .quote(uncollectedFees[0])
                .add(uncollectedFees[1]);

          rawPoolLiquidity = rawPoolLiquidity.add(liquidity);
          poolLiquidity = poolLiquidity.add(positionLiquidity);
          poolUncollectedFees = poolUncollectedFees.add(
            positionUncollectedFees
          );

          return {
            id,
            entity,
            positionLiquidity,
            uncollectedFees,
            positionUncollectedFees,
          };
        }
      );

      return { enhanced, poolLiquidity, rawPoolLiquidity, poolUncollectedFees };
    };

    const callContract = async (contract: Contract | null, idx: number) => {
      if (!contract) {
        return null;
      }

      const result = await contract.functions.slot0();
      const sqrtPriceX96 = result[0];
      const tickCurrent = result[1];

      const { token0, token1, fee, quoteToken, baseToken } = params[idx];
      if (!token0 || !token1) {
        return null;
      }
      const key = `${token0.address}-${token1.address}-${fee}`;

      const entity = new Pool(
        token0 as Token,
        token1 as Token,
        fee,
        sqrtPriceX96,
        0,
        tickCurrent
      );

      const {
        rawPoolLiquidity,
        poolLiquidity,
        poolUncollectedFees,
        enhanced: positions,
      } = enhancePositions(entity, baseToken, positionsByPool[key]);

      return {
        key,
        rawPoolLiquidity,
        poolLiquidity,
        poolUncollectedFees,
        quoteToken,
        baseToken,
        address: contract.address.toLowerCase(),
        entity,
        positions,
      };
    };

    const collectPools = async () => {
      const newPools = await Promise.all(
        contracts.map((contract: Contract | null, idx: number) =>
          callContract(contract, idx)
        )
      );
      const newPoolsCompact = compact(newPools).sort((a, b) =>
        a.rawPoolLiquidity.gte(b.rawPoolLiquidity) ? -1 : 1
      );
      if (!newPoolsCompact.length) {
        return;
      }
      if (
        newPoolsCompact.length === pools.length &&
        isEqualWith(
          newPoolsCompact,
          pools,
          (newPool, curPool) => newPool.key === curPool.key
        )
      ) {
        return;
      }
      setPools(newPoolsCompact);
    };

    collectPools();
  }, [contracts, params, positionsByPool, pools, chainId]);

  return pools;
}
