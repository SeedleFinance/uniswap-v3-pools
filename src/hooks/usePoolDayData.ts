import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

import { getClient } from "../apollo/client";

const QUERY_POOL_DAY_DATA = gql`
  query pool_day_data($poolAddress: String!) {
    pool(id: $poolAddress) {
      poolDayData(first: 30, orderBy: date, orderDirection: desc) {
        id
        date
        tick
      }
    }
  }
`;

export function usePoolDayData(poolAddress: string | null, chainId: number) {
  const { loading, error, data } = useQuery(QUERY_POOL_DAY_DATA, {
    variables: { poolAddress },
    fetchPolicy: "network-only",
    client: getClient(chainId),
  });

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
}
