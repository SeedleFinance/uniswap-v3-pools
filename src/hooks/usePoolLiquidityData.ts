import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { Token } from "@uniswap/sdk-core";
import { Pool, tickToPrice } from "@uniswap/v3-sdk";
import format from "date-fns/format";
import JSBI from "jsbi";

import { getClient } from "../apollo/client";

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
  pool: Pool
) {
  const { loading, error, data } = useQuery(QUERY_POOL_LIQUIDITY_DATA, {
    variables: { poolAddress },
    fetchPolicy: "network-only",
    client: getClient(chainId),
  });

  if (loading || error || !data) {
    return [];
  }

  const allTicks = data.pool.ticks.map(({ tick, liquidityNet }) => {
    return {
      tick: Number(tick),
      liquidityNet: JSBI.BigInt(liquidityNet),
    };
  });

  const pivot = allTicks.findIndex((t) => t.tick > pool.tickCurrent) - 1;
  if (pivot === -1) {
    return [];
  }
  const activeTick = {
    tick: pool.tickCurrent,
    liquidity: JSBI.BigInt(pool.liquidity),
  };

  // ascending ticks
  let ascendingTicks = [];
  for (let i = pivot + 1; i < allTicks.length; i++) {
    const t = allTicks[i];
    const previousTick = ascendingTicks.length
      ? ascendingTicks[ascendingTicks.length - 1]
      : activeTick;
    ascendingTicks.push({
      tick: t.tick,
      liquidity: JSBI.add(previousTick.liquidity, t.liquidityNet),
    });
  }

  // descending ticks
  let descendingTicks = [];
  for (let i = pivot - 1; i >= 0; i--) {
    const t = allTicks[i];
    const previousTick = descendingTicks.length
      ? descendingTicks[descendingTicks.length - 1]
      : activeTick;
    descendingTicks.push({
      tick: t.tick,
      liquidity: JSBI.subtract(previousTick.liquidity, t.liquidityNet),
    });
  }

  return [...ascendingTicks.reverse(), activeTick, ...descendingTicks]
    .map(({ tick, liquidity }) => ({
      tick,
      price: parseFloat(
        tickToPrice(quoteToken, baseToken, tick).toSignificant(8)
      ),
      liquidity: parseFloat(liquidity.toString()),
    }))
    .filter(({ liquidity }) => liquidity > 0);
}
