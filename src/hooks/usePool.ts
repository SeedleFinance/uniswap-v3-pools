import { useState, useEffect } from "react";
import { compact, isEqualWith } from "lodash";
import { Position, Pool } from "@uniswap/v3-sdk";
import { Contract } from "@ethersproject/contracts";
import {
  ChainId,
  WETH9,
  Token,
  Price,
  CurrencyAmount,
} from "@uniswap/sdk-core";
import { BigNumber } from "@ethersproject/bignumber";
import { useWeb3React } from "@web3-react/core";

import { DAI, USDC, USDT, FEI, LUSD } from "../constants";
import { usePoolContract } from "./useContract";
import { PositionState } from "./usePosition";

export interface PoolState {
  key: string;
  address: string;
  quoteToken: Token | null;
  baseToken: Token | null;
  entity: Pool;
  rawLiquidity: BigNumber;
  currencyLiquidity: CurrencyAmount<Token>;
  positions: {
    id: BigNumber;
    entity: Position;
    priceLower?: Price<Token, Token>;
    priceUpper?: Price<Token, Token>;
    positionLiquidity?: CurrencyAmount<Token>;
    uncollectedFees?:
      | [CurrencyAmount<Token>, CurrencyAmount<Token>]
      | [undefined, undefined];
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

function getQuoteAndBaseToken(
  chainId: ChainId | undefined,
  token0: Token,
  token1: Token
): [Token, Token] {
  let quote = token0;
  let base = token1;

  if (!chainId || !token0 || !token1) {
    return [quote, base];
  }

  const quoteCurrencies: Token[] = [USDC, USDT, DAI, FEI, LUSD, WETH9[chainId]];

  quoteCurrencies.some((cur) => {
    if (token1.equals(cur)) {
      quote = token1;
      base = token0;
      return true;
    }
    return false;
  });
  return [quote, base];
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
      quoteToken: Token,
      positions: PositionState[]
    ) => {
      let rawLiquidity = BigNumber.from(0);
      let currencyLiquidity = CurrencyAmount.fromRawAmount(quoteToken, 0);

      const enhanced = positions.map(
        ({ id, liquidity, tickLower, tickUpper }: PositionState) => {
          const entity = new Position({
            pool,
            liquidity: liquidity.toString(),
            tickLower,
            tickUpper,
          });

          // liquidity of the position in quote token
          const positionLiquidity = pool.token0.equals(quoteToken)
            ? pool
                .priceOf(pool.token1)
                .quote(entity.amount1)
                .add(entity.amount0)
            : pool
                .priceOf(pool.token0)
                .quote(entity.amount0)
                .add(entity.amount1);

          currencyLiquidity = currencyLiquidity.add(positionLiquidity);
          rawLiquidity = rawLiquidity.add(liquidity);

          return {
            id,
            entity,
            positionLiquidity,
          };
        }
      );

      return { enhanced, currencyLiquidity, rawLiquidity };
    };

    const callContract = async (contract: Contract | null, idx: number) => {
      if (!contract) {
        return null;
      }

      const result = await contract.functions.slot0();
      const sqrtPriceX96 = result[0];
      const tickCurrent = result[1];

      const { token0, token1, fee } = params[idx];
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

      const [quoteToken, baseToken] = getQuoteAndBaseToken(
        chainId,
        token0,
        token1
      );

      const {
        rawLiquidity,
        currencyLiquidity,
        enhanced: positions,
      } = enhancePositions(entity, quoteToken, positionsByPool[key]);

      return {
        key,
        rawLiquidity,
        currencyLiquidity,
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
        a.rawLiquidity.gte(b.rawLiquidity) ? -1 : 1
      );
      if (!newPoolsCompact.length) {
        return;
      }
      if (
        pools.length &&
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
