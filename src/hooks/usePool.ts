import { useState, useEffect } from "react";
import { compact, isEqualWith } from "lodash";
import { Pool } from "@uniswap/v3-sdk";
import { Contract } from "@ethersproject/contracts";
import { Token, Price, CurrencyAmount } from "@uniswap/sdk-core";
import { BigNumber } from "@ethersproject/bignumber";

import { usePoolContract } from "./useContract";

export interface PoolState {
  key: string;
  address: string;
  entity: Pool;
  liquidity: BigNumber;
  positions?: {
    id: BigNumber;
    tickLower: number;
    tickUpper: number;
    liquidity: BigNumber;
    priceLower?: Price<Token, Token>;
    priceUpper?: Price<Token, Token>;
    currentLiquidity?: Price<Token, Token>;
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

export function usePoolsState(
  contracts: (Contract | null)[],
  params: any[],
  positionsByPool: { [key: string]: any }
) {
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

      const positions = positionsByPool[key];
      const liquidity = positions.reduce(
        (val: BigNumber, position: { liquidity: BigNumber }) => {
          return val.add(position.liquidity);
        },
        BigNumber.from(0)
      );

      return {
        key,
        liquidity,
        address: contract.address.toLowerCase(),
        entity: new Pool(
          token0 as Token,
          token1 as Token,
          fee,
          sqrtPriceX96,
          0,
          tickCurrent
        ),
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
        a.liquidity.gte(b.liquidity) ? -1 : 1
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
  }, [contracts, params, positionsByPool, pools]);

  return pools;
}
