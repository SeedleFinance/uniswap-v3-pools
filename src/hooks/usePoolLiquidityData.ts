import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { Token } from '@uniswap/sdk-core';
import { Pool, tickToPrice } from '@uniswap/v3-sdk';
import JSBI from 'jsbi';

import { getClient } from '../lib/apollo';

const QUERY_POOL_LIQUIDITY_DATA = gql`
  query pool_liquidity_data($poolAddress: String!) {
    pool(id: $poolAddress) {
      id
      ticks(first: 1000, orderBy: tickIdx) {
        tick: tickIdx
        liquidityNet
      }
    }
  }
`;

export function usePoolLiquidityData(
  chainId: number,
  poolAddress: string | null,
  quoteToken: Token,
  baseToken: Token,
  pool: Pool,
) {
  const { loading, error, data } = useQuery(QUERY_POOL_LIQUIDITY_DATA, {
    variables: { poolAddress },
    fetchPolicy: 'network-only',
    client: getClient(chainId),
  });

  if (loading || error || !data) {
    return [];
  }

  const allTicks = data.pool.ticks.map(
    ({ tick, liquidityNet }: { tick: string; liquidityNet: number }) => {
      return {
        tick: Number(tick),
        liquidityNet: JSBI.BigInt(liquidityNet),
      };
    },
  );

  const pivot = allTicks.findIndex(({ tick }: { tick: number }) => tick > pool.tickCurrent) - 1;
  if (pivot === -2) {
    return [];
  }
  const activeTick = {
    tick: pool.tickCurrent,
    liquidity: JSBI.BigInt(pool.liquidity),
  };

  // ticks after active tick
  let afterTicks = [];
  for (let i = pivot + 1; i < allTicks.length; i++) {
    const t = allTicks[i];
    const previousTick: { tick: number; liquidity: JSBI } = afterTicks.length
      ? afterTicks[afterTicks.length - 1]
      : activeTick;
    afterTicks.push({
      tick: t.tick,
      liquidity: JSBI.add(previousTick.liquidity, t.liquidityNet),
    });
  }

  // ticks before active tick
  let beforeTicks = [];
  for (let i = pivot - 1; i >= 0; i--) {
    const t = allTicks[i];
    const previousTick: { tick: number; liquidity: JSBI } = beforeTicks.length
      ? beforeTicks[0]
      : activeTick;
    beforeTicks.unshift({
      tick: t.tick,
      liquidity: JSBI.subtract(previousTick.liquidity, t.liquidityNet),
    });
  }

  const results = [...beforeTicks, activeTick, ...afterTicks]
    .map(({ tick, liquidity }) => ({
      tick,
      price: parseFloat(tickToPrice(quoteToken, baseToken, tick).toSignificant(8)),
      liquidity: parseFloat(liquidity.toString()),
    }))
    .filter(({ liquidity }) => liquidity > 0);

  if (baseToken.sortsBefore(quoteToken)) {
    return results.reverse();
  }
  return results;
}
