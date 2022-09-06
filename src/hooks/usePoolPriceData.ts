import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { Token } from '@uniswap/sdk-core';
import { tickToPrice } from '@uniswap/v3-sdk';
import format from 'date-fns/format';

import { getClient } from '../lib/apollo';

const QUERY_POOL_DAY_DATA = gql`
  query pool_day_data($poolAddress: String!, $days: Int!, $hours: Int!) {
    pool(id: $poolAddress) {
      id
      poolDayData(first: $days, orderBy: date, orderDirection: desc) {
        id
        date
        tick
      }
      poolHourData(first: $hours, orderBy: periodStartUnix, orderDirection: desc) {
        id
        periodStartUnix
        tick
      }
    }
  }
`;

export function usePoolPriceData(
  chainId: number,
  poolAddress: string | null,
  quoteToken: Token | null,
  baseToken: Token | null,
  period: number,
) {
  let days = period <= 30 ? 30 : 365;
  let hours = 1;

  if (period === 0) {
    days = 1;
    hours = 24;
  }
  const { loading, error, data } = useQuery(QUERY_POOL_DAY_DATA, {
    variables: { poolAddress, days, hours },
    fetchPolicy: 'network-only',
    client: getClient(chainId),
  });

  const poolData = useMemo(() => {
    if (loading || error || !data || !data.pool) {
      return [];
    }

    if (period === 0) {
      return data.pool.poolHourData.map(({ id, periodStartUnix, tick }: any) => {
        return {
          id,
          date: parseInt(periodStartUnix, 10),
          tick: parseInt(tick, 10),
        };
      });
    }

    return data.pool.poolDayData.map(({ id, date, tick }: any) => {
      return {
        id,
        date: parseInt(date, 10),
        tick: parseInt(tick, 10),
      };
    });
  }, [loading, error, period, data]);

  const priceData = useMemo(() => {
    if (!baseToken || !quoteToken || !poolData || !poolData.length) {
      return [];
    }

    const formatDate = (date: number) => {
      const dt = new Date(date * 1000);
      return period === 0 ? format(dt, 'HH:mm') : format(dt, 'dd.MMM');
    };

    const items = period === 0 ? 24 : period;
    return poolData
      .filter(({ tick }: { tick: number }) => !Number.isNaN(tick))
      .map(({ date, tick }: { date: number; tick: number }) => ({
        date: formatDate(date),
        price: parseFloat(tickToPrice(quoteToken, baseToken, tick).toSignificant(8)),
      }))
      .slice(0, items)
      .reverse();
  }, [poolData, baseToken, quoteToken, period]);

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
      sum(prices.map((price: number) => Math.pow(price - meanPrice, 2))) / prices.length;
    const stdev = Math.sqrt(variance);

    return [minPrice, maxPrice, meanPrice, stdev];
  }, [priceData]);

  return { priceData, minPrice, maxPrice, meanPrice, stdev };
}
