import { useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import gql from "graphql-tag";

const QUERY_ETH_PRICE = gql`
  query eth_price {
    bundles(first: 1) {
      ethPriceUSD
    }
  }
`;

export function useEthPrice(): number {
  const [queryEthPrice, { loading, error, data }] = useLazyQuery(
    QUERY_ETH_PRICE,
    {
      fetchPolicy: "network-only",
    }
  );

  useEffect(() => {
    queryEthPrice();
  }, []);

  if (loading || error || !data) {
    return 0;
  }

  return parseFloat(data.bundles[0].ethPriceUSD);
}
