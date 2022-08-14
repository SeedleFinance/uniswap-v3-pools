import { useEffect, useMemo, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { uniq } from 'lodash';
import gql from 'graphql-tag';
import { BigNumber } from '@ethersproject/bignumber';
import { Token, CurrencyAmount } from '@uniswap/sdk-core';
import { Position, Pool, tickToPrice } from '@uniswap/v3-sdk';

import { useAddress } from '../AddressProvider';
import { useAppSettings } from '../AppSettingsProvider';
import { getPerpClient } from '../apollo/client';
import { useFetchPools } from './fetch';
import { PoolState } from './usePoolsState';

const QUERY_OPEN_ORDERS = gql`
  query openOrdersByAccounts($accounts: [String]!, $liquidity: BigInt) {
    openOrders(
      where: { maker_in: $accounts, liquidity_gt: $liquidity }
      orderBy: id
      orderDirection: desc
      first: 1000
    ) {
      id
      baseToken
      lowerTick
      upperTick
      liquidity
      collectedFee
      timestamp
      marketRef {
        pool
      }
      maker
      baseToken
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
  collectedFee: number;
  timestamp: Date;
  poolAddress: string;
  maker: string;
  baseTokenAddress: string;
}

function useQueryPerpOpenOrders(
  chainId: number,
  accounts: string[],
  includeEmpty: boolean,
): { loading: boolean; positionStates: PerpPositionState[] } {
  const [queryOpenOrders, { loading, error, data }] = useLazyQuery(QUERY_OPEN_ORDERS, {
    variables: { accounts, liquidity: includeEmpty ? -1 : 0 },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    client: getPerpClient(chainId),
  });

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
        baseToken,
        collectedFee,
        timestamp,
        marketRef,
        maker,
      }: any) => ({
        id,
        tickLower: parseInt(lowerTick, 10),
        tickUpper: parseInt(upperTick, 10),
        liquidity: BigNumber.from(liquidity),
        collectedFee: parseFloat(collectedFee),
        timestamp: new Date(parseInt(timestamp, 10) * 1000),
        poolAddress: marketRef.pool,
        maker,
        baseTokenAddress: baseToken,
      }),
    );
  }, [loading, error, data]);

  return { loading, positionStates };
}

function usePerpUncollectedFees(
  chainId: number,
  positions: PerpPositionState[],
): { loading: boolean; uncollectedFees: { hex: string }[] } {
  const [loading, setLoading] = useState(true);
  const [uncollectedFees, setUncollectedFees] = useState([]);

  useEffect(() => {
    const _call = async () => {
      setLoading(true);

      const url = 'https://ql2p37n7rb.execute-api.us-east-2.amazonaws.com/perp_fees';
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ chainId, positions }),
      });
      if (!res.ok) {
        const errors = await res.json();
        console.error(errors);
        setUncollectedFees([]);
        setLoading(false);

        return;
      }

      const results = await res.json();

      setUncollectedFees(results);
      setLoading(false);
    };

    if (!positions.length) {
      setUncollectedFees([]);
      setLoading(false);

      return;
    }

    _call();
  }, [chainId, positions]);

  return { loading, uncollectedFees };
}

function usePerpPools(
  chainId: number,
  poolAddresses: string[],
): {
  loading: boolean;
  pools: Pool[];
} {
  const { loading, poolStates } = useFetchPools(chainId, poolAddresses);
  const pools = useMemo(() => {
    if (!poolStates.length) {
      return [];
    }

    return poolStates.map((pool) => {
      const token0 = new Token(
        chainId,
        pool.token0.address,
        parseInt(pool.token0.decimals, 10),
        pool.token0.symbol,
        pool.token0.name,
      );
      const token1 = new Token(
        chainId,
        pool.token1.address,
        parseInt(pool.token1.decimals, 10),
        pool.token1.symbol,
        pool.token1.name,
      );
      return new Pool(token0, token1, pool.fee, pool.sqrtPriceX96, pool.liquidity, pool.tick);
    });
  }, [poolStates, chainId]);

  return { loading, pools };
}

export function usePerpV2(chainId: number): {
  loading: boolean;
  pools: PoolState[];
} {
  const { filterClosed } = useAppSettings();
  const { addresses } = useAddress();
  const { loading: loadingPositions, positionStates } = useQueryPerpOpenOrders(
    chainId,
    addresses,
    !filterClosed,
  );

  const { loading: loadingFees, uncollectedFees: uncollectedFeesByPosition } =
    usePerpUncollectedFees(chainId, positionStates);

  const poolAddresses = useMemo(() => {
    if (loadingPositions) {
      return [];
    }

    return uniq(positionStates.map(({ poolAddress }) => poolAddress));
  }, [loadingPositions, positionStates]);

  const { loading: loadingPools, pools } = usePerpPools(chainId, poolAddresses);

  const positionsByPool = useMemo(() => {
    const positionsByPool: { [key: string]: any[] } = {};

    if (!positionStates.length || !pools.length || !uncollectedFeesByPosition.length) {
      return positionsByPool;
    }

    positionStates.forEach((position, idx) => {
      // enhance position
      const pool = pools[poolAddresses.indexOf(position.poolAddress)];

      const entity = new Position({
        pool,
        liquidity: position.liquidity.toString(),
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
      });

      const priceLower = tickToPrice(pool.token1, pool.token0, position.tickLower);
      const priceUpper = tickToPrice(pool.token1, pool.token0, position.tickUpper);

      const positionLiquidity = pool.priceOf(pool.token0).quote(entity.amount0).add(entity.amount1);

      const uncollectedFees = [
        CurrencyAmount.fromRawAmount(pool.token0, 0),
        CurrencyAmount.fromRawAmount(pool.token1, 0),
      ];

      const positionUncollectedFees = CurrencyAmount.fromRawAmount(
        pool.token1,
        uncollectedFeesByPosition.length && uncollectedFeesByPosition[idx]
          ? BigNumber.from(uncollectedFeesByPosition[idx].hex).toString()
          : 0,
      );

      const enhanced = {
        id: position.id,
        entity,
        priceLower,
        priceUpper,
        positionLiquidity,
        uncollectedFees,
        positionUncollectedFees,
        transactions: [],
      };

      const entry = positionsByPool[position.poolAddress] || [];
      entry.push(enhanced);
      positionsByPool[position.poolAddress] = entry;
    });

    return positionsByPool;
  }, [poolAddresses, pools, positionStates, uncollectedFeesByPosition]);

  const poolStates = useMemo(() => {
    if (!Object.keys(positionsByPool).length || !pools.length) {
      return [];
    }

    return poolAddresses.map((address, idx) => {
      const pool = pools[idx];
      const positions = positionsByPool[address.toLowerCase()];

      let rawPoolLiquidity = BigNumber.from(0);
      let poolLiquidity = CurrencyAmount.fromRawAmount(pool.token1, 0);
      let poolUncollectedFees = CurrencyAmount.fromRawAmount(pool.token1, 0);

      positions.forEach(({ entity, positionLiquidity, positionUncollectedFees }) => {
        rawPoolLiquidity = rawPoolLiquidity.add(BigNumber.from(entity.liquidity.toString()));
        poolLiquidity = poolLiquidity.add(positionLiquidity);
        poolUncollectedFees = poolUncollectedFees.add(positionUncollectedFees);
      });

      return {
        key: address,
        address,
        quoteToken: pool.token0,
        baseToken: pool.token1,
        tick: pool.tickCurrent,
        entity: pool,
        positions,
        rawPoolLiquidity,
        poolLiquidity,
        poolUncollectedFees,
      };
    });
  }, [poolAddresses, pools, positionsByPool]);

  return { loading: loadingPositions || loadingFees || loadingPools, pools: poolStates };
}
