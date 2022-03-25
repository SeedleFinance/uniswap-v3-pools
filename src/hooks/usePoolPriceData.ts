import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { Token } from "@uniswap/sdk-core";
import { tickToPrice } from "@uniswap/v3-sdk";
import format from "date-fns/format";

import { getClient } from "../apollo/client";

const QUERY_POOL_DAY_DATA = gql`
  query pool_day_data($poolAddress: String!) {
    pool(id: $poolAddress) {
      id
      poolDayData(first: 30, orderBy: date, orderDirection: desc) {
        id
        date
        tick
      }
    }
  }
`;

export function usePoolPriceData(
  chainId: number,
  poolAddress: string | null,
  quoteToken: Token | null,
  baseToken: Token | null
) {
  const { loading, error, data } = useQuery(QUERY_POOL_DAY_DATA, {
    variables: { poolAddress },
    fetchPolicy: "network-only",
    client: getClient(chainId),
  });

  const poolDayData = useMemo(() => {
    if (loading || error || !data) {
      return [];
    }

    return data.pool.poolDayData.map(({ id, date, tick }: any) => {
      return {
        id,
        date: parseInt(date, 10),
        tick: parseInt(tick, 10),
      };
    });
  }, [loading, error, data]);

  const priceData = useMemo(() => {
    if (!baseToken || !quoteToken || !poolDayData || !poolDayData.length) {
      return [];
    }

    return poolDayData
      .filter(({ tick }: { tick: number }) => !Number.isNaN(tick))
      .map(({ date, tick }: { date: number; tick: number }) => ({
        date: format(new Date(date * 1000), "dd.MMM"),
        price: parseFloat(
          tickToPrice(quoteToken, baseToken, tick).toSignificant(8)
        ),
      }))
      .reverse();
  }, [poolDayData, baseToken, quoteToken]);

  const [minPrice, maxPrice, meanPrice, stdev] = useMemo(() => {
    if (!priceData || !priceData.length) {
      return [0, 0, 0, 0];
    }

    const prices = priceData.map((d: { price: number }) => d.price);

    const sum = (values: number[]) => {
      return values.reduce((s: number, p: number) => {
        return s + p;
      }, 0);
    };

    const pricesSum = sum(prices);

    const pricesSorted = prices.sort((a: number, b: number) => a - b);

    const minPrice = pricesSorted[0];
    const maxPrice = pricesSorted[pricesSorted.length - 1];
    const meanPrice = pricesSum / prices.length;

    const variance =
      sum(prices.map((price: number) => Math.pow(price - meanPrice, 2))) /
      prices.length;
    const stdev = Math.sqrt(variance);

    return [minPrice, maxPrice, meanPrice, stdev];
  }, [priceData]);

  return { priceData, minPrice, maxPrice, meanPrice, stdev };
}
