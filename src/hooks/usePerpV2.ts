import { useEffect, useMemo } from "react";
import { useLazyQuery } from "@apollo/client";
import { uniq } from "lodash";
import gql from "graphql-tag";
import JSBI from "jsbi";
import { BigNumber } from "@ethersproject/bignumber";
import { Token, CurrencyAmount } from "@uniswap/sdk-core";
import { Position, Pool, tickToPrice } from "@uniswap/v3-sdk";

import { useAddress } from "../AddressProvider";
import { getClient, getPerpClient } from "../apollo/client";
import { PoolState } from "./usePoolsState";

const QUERY_POOLS = gql`
  query pools($addresses: [String]!) {
    pools(where: { id_in: $addresses }) {
      id
      token0 {
        id
        decimals
        symbol
        name
      }
      token1 {
        id
        decimals
        symbol
        name
      }
      feeTier
      tick
      sqrtPrice
    }
  }
`;

const QUERY_OPEN_ORDERS = gql`
  query openOrdersByAccounts($accounts: [String]!) {
    openOrders(where: { maker_in: $accounts }) {
      id
      baseToken
      lowerTick
      upperTick
      baseAmount
      quoteAmount
      liquidity
      collectedFee
      timestamp
      marketRef {
        pool
      }
    }
  }
`;

export interface PerpPositionState {
  id: string;
  token0: Token;
  token1: Token;
  pool: Pool;
  tickLower: number;
  tickUpper: number;
  liquidity: BigNumber;
  baseAmount: number;
  quoteAmount: number;
  collectedFee: number;
  timestamp: Date;
  poolAddress: string;
}

export function useQueryPerpOpenOrders(
  chainId: number,
  accounts: string[]
): { loading: boolean; positionStates: PerpPositionState[] } {
  const [queryOpenOrders, { loading, error, data }] = useLazyQuery(
    QUERY_OPEN_ORDERS,
    {
      variables: { accounts },
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      client: getPerpClient(chainId),
    }
  );

  useEffect(() => {
    if (!accounts.length) {
      return;
    }

    queryOpenOrders();
    // eslint-disable-next-line
  }, [accounts]);

  const positionStates = useMemo(() => {
    if (loading) {
      return [];
    }

    if (error || !data) {
      return [];
    }

    return data.openOrders.map(
      ({
        id,
        lowerTick,
        upperTick,
        liquidity,
        baseAmount,
        quoteAmount,
        collectedFee,
        timestamp,
        marketRef,
      }: any) => ({
        id,
        tickLower: parseInt(lowerTick, 10),
        tickUpper: parseInt(upperTick, 10),
        liquidity: BigNumber.from(liquidity),
        baseAmount: parseFloat(baseAmount),
        quoteAmount: parseFloat(quoteAmount),
        collectedFee: parseFloat(collectedFee),
        timestamp: new Date(parseInt(timestamp, 10) * 1000),
        poolAddress: marketRef.pool,
      })
    );
  }, [loading, error, data]);

  return { loading, positionStates };
}

export function useQueryPools(chainId: number, addresses: string[]) {
  const [queryPools, { loading, error, data }] = useLazyQuery(QUERY_POOLS, {
    variables: { addresses },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    client: getClient(chainId),
  });

  useEffect(() => {
    if (!addresses.length) {
      return;
    }

    queryPools();
    // eslint-disable-next-line
  }, [addresses]);

  const pools = useMemo(() => {
    if (loading || error || !data) {
      return [];
    }

    const entries = data.pools.map((pool: any) => {
      const token0 = new Token(
        chainId,
        pool.token0.id,
        parseInt(pool.token0.decimals, 10),
        pool.token0.symbol,
        pool.token0.name
      );
      const token1 = new Token(
        chainId,
        pool.token1.id,
        parseInt(pool.token1.decimals, 10),
        pool.token1.symbol,
        pool.token1.name
      );
      const fee = parseInt(pool.feeTier, 10);
      const sqrtPriceX96 = JSBI.BigInt(pool.sqrtPrice);
      const tickCurrent = parseInt(pool.tick, 10);

      return [
        pool.id,
        new Pool(
          token0 as Token,
          token1 as Token,
          fee,
          sqrtPriceX96,
          0,
          tickCurrent
        ),
      ];
    });

    return Object.fromEntries(entries);
  }, [chainId, loading, error, data]);
  return { loading, pools };
}

export function usePerpV2(chainId: number): {
  loading: boolean;
  pools: PoolState[];
} {
  const { addresses } = useAddress();
  const { loading: loadingPositions, positionStates } = useQueryPerpOpenOrders(
    chainId,
    addresses
  );

  const poolAddresses = useMemo(() => {
    if (loadingPositions) {
      return [];
    }

    return uniq(positionStates.map(({ poolAddress }) => poolAddress));
  }, [loadingPositions, positionStates]);

  const { loading: loadingPools, pools } = useQueryPools(
    chainId,
    poolAddresses
  );

  const positionsByPool = useMemo(() => {
    const positionsByPool: { [key: string]: any[] } = {};

    if (!positionStates.length || !Object.keys(pools).length) {
      return positionsByPool;
    }

    positionStates.forEach((position) => {
      // enhance position
      const pool = pools[position.poolAddress];

      const entity = new Position({
        pool,
        liquidity: position.liquidity.toString(),
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
      });

      const priceLower = tickToPrice(
        pool.token1,
        pool.token0,
        position.tickLower
      );
      const priceUpper = tickToPrice(
        pool.token1,
        pool.token0,
        position.tickUpper
      );

      const positionLiquidity = pool
        .priceOf(pool.token0)
        .quote(entity.amount0)
        .add(entity.amount1);

      const uncollectedFees = [
        CurrencyAmount.fromRawAmount(pool.token0, 0),
        CurrencyAmount.fromRawAmount(pool.token1, 0),
      ];
      const positionUncollectedFees = CurrencyAmount.fromRawAmount(
        pool.token1,
        0
      );

      const enhanced = {
        id: position.id,
        entity,
        priceLower,
        priceUpper,
        positionLiquidity,
        uncollectedFees,
        positionUncollectedFees,
      };

      const entry = positionsByPool[position.poolAddress] || [];
      entry.push(enhanced);
      positionsByPool[position.poolAddress] = entry;
    });

    return positionsByPool;
  }, [pools, positionStates]);

  const poolStates = useMemo(() => {
    if (!positionsByPool || !Object.keys(pools).length) {
      return [];
    }

    return Object.entries(pools).map((entry) => {
      const [address, pool] = entry;
      const positions = positionsByPool[address];
      let rawPoolLiquidity = BigNumber.from(0);
      let poolLiquidity = CurrencyAmount.fromRawAmount(pool.token1, 0);
      let poolUncollectedFees = CurrencyAmount.fromRawAmount(pool.token1, 0);

      positions.forEach(
        ({ entity, positionLiquidity, positionUncollectedFees }) => {
          //rawPoolLiquidity = rawPoolLiquidity.add(entity.liquidity);
          poolLiquidity = poolLiquidity.add(positionLiquidity);
          poolUncollectedFees = poolUncollectedFees.add(
            positionUncollectedFees
          );
        }
      );

      return {
        key: address,
        address,
        quoteToken: pool.token0,
        baseToken: pool.token1,
        entity: pool,
        positions,
        rawPoolLiquidity,
        poolLiquidity,
        poolUncollectedFees,
      };
    });
  }, [pools, positionsByPool]);

  return { loading: loadingPositions || loadingPools, pools: poolStates };
}
