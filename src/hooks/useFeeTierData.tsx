import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

import { getClient } from "../apollo/client";

const QUERY_FEE_TIER_DATA = gql`
  query fee_tier_data($poolAddresses: [String]!) {
    pools(where: { id_in: $poolAddresses }) {
      poolDayData(first: 7, orderBy: date, orderDirection: desc) {
        id
        date
        tvlUSD
        feesUSD
        volumeUSD
      }
    }
  }
`;

export function useFeeTierData(
  chainId: number
  poolAddresses: string[] | null,
) {
  const { loading, error, data } = useQuery(QUERY_FEE_TIER_DATA, {
    variables: { poolAddresses },
    fetchPolicy: "network-only",
    client: getClient(chainId),
  });

  if (loading || error || !data) {
    return [];
  }

  return data.pools.map(pool => {
    return pool.poolDayData.map(({ id, date, tvlUSD, feesUSD, volumeUSD }: any) => {
      return {
        id,
        date,
        tvlUSD: parseFloat(tvlUSD),
        feesUSD: parseFloat(feesUSD),
        volumeUSD: parseFloat(volumeUSD)
      };
    });
  });
}
