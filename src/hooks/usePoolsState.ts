import { useState, useEffect } from "react";
import { compact, isEqualWith } from "lodash";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { Token, Price, CurrencyAmount } from "@uniswap/sdk-core";
import { Position, Pool, tickToPrice } from "@uniswap/v3-sdk";

import { PositionState } from "./useQueryPositions";
import { Q128 } from "../constants";
import { getQuoteAndBaseToken } from "../utils/tokens";
import { multiplyIn256 } from "../utils/numbers";

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

export function usePoolsState(
  contracts: (Contract | null)[],
  positionsByPool: { [key: string]: any }
) {
  const [pools, setPools] = useState<PoolState[]>([]);

  useEffect(() => {
    if (
      !contracts.length ||
      !positionsByPool ||
      !Object.keys(positionsByPool).length
    ) {
      return;
    }

    const getUncollectedFees = async (
      contract: Contract | null,
      tickLower: number,
      tickUpper: number,
      liquidity: BigNumber,
      token0: Token,
      token1: Token,
      feeGrowthInside0LastX128: BigNumber,
      feeGrowthInside1LastX128: BigNumber
    ) => {
      if (!contract) {
        return [];
      }

      const result = await contract.functions.slot0();
      const tickCurrent = result[1];
      const feeGrowthGlobal0X128 = await contract.feeGrowthGlobal0X128();
      const feeGrowthGlobal1X128 = await contract.feeGrowthGlobal1X128();

      const tickUpperResult = await contract.functions.ticks(tickUpper);

      let fa0, fa1;
      if (tickCurrent < tickUpper) {
        fa0 = tickUpperResult[2];
        fa1 = tickUpperResult[3];
      } else {
        fa0 = feeGrowthGlobal0X128.sub(tickUpperResult[2]);
        fa1 = feeGrowthGlobal1X128.sub(tickUpperResult[3]);
      }

      const tickLowerResult = await contract.functions.ticks(tickLower);

      let fb0, fb1;
      if (tickCurrent >= tickLower) {
        fb0 = tickLowerResult[2];
        fb1 = tickLowerResult[3];
      } else {
        fb0 = feeGrowthGlobal0X128.sub(tickLowerResult[2]);
        fb1 = feeGrowthGlobal1X128.sub(tickLowerResult[3]);
      }

      const fr0 = feeGrowthGlobal0X128.sub(fb0).sub(fa0);
      const fr1 = feeGrowthGlobal1X128.sub(fb1).sub(fa1);

      let amount0 = multiplyIn256(
        fr0.sub(feeGrowthInside0LastX128),
        liquidity
      ).div(Q128);
      let amount1 = multiplyIn256(
        fr1.sub(feeGrowthInside1LastX128),
        liquidity
      ).div(Q128);

      return [
        CurrencyAmount.fromRawAmount(token0, amount0.toString()),
        CurrencyAmount.fromRawAmount(token1, amount1.toString()),
      ];
    };

    const enhancePosition = async (
      contract: Contract | null,
      baseToken: Token,
      quoteToken: Token,
      {
        id,
        pool,
        liquidity,
        tickLower,
        tickUpper,
        feeGrowthInside0LastX128,
        feeGrowthInside1LastX128,
      }: PositionState
    ) => {
      const entity = new Position({
        pool,
        liquidity: liquidity.toString(),
        tickLower,
        tickUpper,
      });

      const priceLower = tickToPrice(quoteToken, baseToken, tickLower);
      const priceUpper = tickToPrice(quoteToken, baseToken, tickUpper);

      const positionLiquidity = pool.token0.equals(baseToken)
        ? pool.priceOf(pool.token1).quote(entity.amount1).add(entity.amount0)
        : pool.priceOf(pool.token0).quote(entity.amount0).add(entity.amount1);

      const uncollectedFees = await getUncollectedFees(
        contract,
        tickLower,
        tickUpper,
        liquidity,
        pool.token0,
        pool.token1,
        feeGrowthInside0LastX128,
        feeGrowthInside1LastX128
      );

      const positionUncollectedFees = pool.token0.equals(baseToken)
        ? pool
            .priceOf(pool.token1)
            .quote(uncollectedFees[1])
            .add(uncollectedFees[0])
        : pool
            .priceOf(pool.token0)
            .quote(uncollectedFees[0])
            .add(uncollectedFees[1]);

      return {
        id: id,
        entity,
        priceLower,
        priceUpper,
        liquidity,
        positionLiquidity,
        uncollectedFees,
        positionUncollectedFees,
      };
    };

    const getPool = async (contract: Contract | null, idx: number) => {
      if (!contract) {
        return null;
      }

      const positions = Object.values(positionsByPool)[idx];
      const { pool } = positions[0];

      const address = contract.address.toLowerCase();

      const [quoteToken, baseToken] = getQuoteAndBaseToken(
        pool.token0.chainId,
        pool.token0,
        pool.token1
      );

      let rawPoolLiquidity = BigNumber.from(0);
      let poolLiquidity = CurrencyAmount.fromRawAmount(baseToken, 0);
      let poolUncollectedFees = CurrencyAmount.fromRawAmount(baseToken, 0);

      const enhancedPositions = await Promise.all<any>(
        positions.map((position: any) =>
          enhancePosition(contract, baseToken, quoteToken, position)
        )
      );

      enhancedPositions.forEach(
        ({ liquidity, positionLiquidity, positionUncollectedFees }) => {
          rawPoolLiquidity = rawPoolLiquidity.add(liquidity);
          poolLiquidity = poolLiquidity.add(positionLiquidity);
          poolUncollectedFees = poolUncollectedFees.add(
            positionUncollectedFees
          );
        }
      );

      return {
        key: address,
        address,
        rawPoolLiquidity,
        poolLiquidity,
        poolUncollectedFees,
        quoteToken,
        baseToken,
        entity: pool,
        positions: enhancedPositions,
      };
    };

    const initPools = async () => {
      let results = await Promise.all(
        contracts.map((contract: Contract | null, idx: number) =>
          getPool(contract, idx)
        )
      );
      results = compact(results);
      if (
        results.length === pools.length &&
        isEqualWith(
          results,
          pools,
          (newPool, curPool) => newPool.key === curPool.key
        )
      ) {
        return;
      }
      setPools(compact(results));
    };

    initPools();
  }, [contracts, pools, positionsByPool]);

  return pools;
}
