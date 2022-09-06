import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';

import { getClient } from '../lib/apollo';

const QUERY_FEE_TIER_DATA = gql`
  query fee_tier_data($addr0: ID, $addr1: ID, $addr2: ID, $addr3: ID) {
    pool0: pool(id: $addr0) {
      poolDayData(first: 30, orderBy: date, orderDirection: desc) {
        id
        date
        tvlUSD
        feesUSD
        volumeUSD
      }
    }
    pool1: pool(id: $addr1) {
      poolDayData(first: 30, orderBy: date, orderDirection: desc) {
        id
        date
        tvlUSD
        feesUSD
        volumeUSD
      }
    }
    pool2: pool(id: $addr2) {
      poolDayData(first: 30, orderBy: date, orderDirection: desc) {
        id
        date
        tvlUSD
        feesUSD
        volumeUSD
      }
    }
    pool3: pool(id: $addr3) {
      poolDayData(first: 30, orderBy: date, orderDirection: desc) {
        id
        date
        tvlUSD
        feesUSD
        volumeUSD
      }
    }
  }
`;

export function useFeeTierData(chainId: number, poolAddresses: string[]) {
  const { loading, error, data } = useQuery(QUERY_FEE_TIER_DATA, {
    variables: {
      addr0: poolAddresses[0],
      addr1: poolAddresses[1],
      addr2: poolAddresses[2],
      addr3: poolAddresses[3],
    },
    fetchPolicy: 'network-only',
    client: getClient(chainId),
  });

  if (loading || error || !data) {
    return [];
  }

  const poolData = [
    data.pool0 ? data.pool0.poolDayData : [],
    data.pool1 ? data.pool1.poolDayData : [],
    data.pool2 ? data.pool2.poolDayData : [],
    data.pool3 ? data.pool3.poolDayData : [],
  ];

  return poolData.map((pool) => {
    return pool
      .map(({ id, date, tvlUSD, feesUSD, volumeUSD }: any) => {
        return {
          id,
          date,
          tvlUSD: parseFloat(tvlUSD),
          feesUSD: parseFloat(feesUSD),
          volumeUSD: parseFloat(volumeUSD),
        };
      })
      .reverse();
  });
}
