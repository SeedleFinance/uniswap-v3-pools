import { useQuery } from "@apollo/client";
import gql from "graphql-tag";

const QUERY_ETH_PRICE = gql`
  query eth_price {
    bundles(first: 1) {
      ethPriceUSD
    }
  }
`;

export function useEthPrice(): number {
  const { loading, error, data } = useQuery(QUERY_ETH_PRICE, {
    fetchPolicy: "network-only",
  });

  if (loading || error) {
    return 0;
  }

  return parseFloat(data.bundles[0].ethPriceUSD);
}
