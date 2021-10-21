import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";

const QUERY_TOP_POOLS = gql`
  query top_pools($date: Int!) {
    poolDayDatas(
      where: { date: $date }
      orderBy: volumeUSD
      orderDirection: desc
      first: 200
    ) {
      pool {
        feeTier
        tick
        liquidity
        sqrtPrice
        token0 {
          id
          name
          symbol
          decimals
        }
        token1 {
          id
          name
          symbol
          decimals
        }
      }
    }
  }
`;

export function useTopPools(chainId: number | undefined, date: number) {
  const { loading, error, data } = useQuery(QUERY_TOP_POOLS, {
    variables: { date },
    fetchPolicy: "network-only",
  });

  if (loading || error || !data) {
    return [];
  }

  const results = data.poolDayDatas.map(({ pool }: any) => {
    const token0 = new Token(
      chainId as number,
      pool.token0.id,
      parseInt(pool.token0.decimals, 10),
      pool.token0.symbol,
      pool.token0.name
    );
    const token1 = new Token(
      chainId as number,
      pool.token1.id,
      parseInt(pool.token1.decimals, 10),
      pool.token1.symbol,
      pool.token1.name
    );

    const entity = new Pool(
      token0,
      token1,
      parseInt(pool.feeTier, 10),
      parseInt(pool.sqrtPrice, 10),
      parseInt(pool.liquidity, 10),
      parseInt(pool.tick, 10)
    );
    const key = `${token0.address}-${token1.address}-${entity.fee}`;
    const address = Pool.getAddress(token0, token1, entity.fee);

    return { key, entity, address, quoteToken: token0, baseToken: token1 };
  });
  return results;
}
