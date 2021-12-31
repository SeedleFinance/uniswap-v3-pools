import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { BigNumber } from "@ethersproject/bignumber";
import { Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";

import { useAddress } from "../AddressProvider";
import { getPerpClient } from "../apollo/client";

const QUERY_OPEN_ORDERS = gql`
  query openOrdersByAccounts($accounts: [String]!) {
    openOrders(where: { maker_in: $accounts }) {
      id
      baseToken
      lowerTick
      upperTick
      baseAmount
      quoteAmount
      liquidity
      collectedFee
    }
  }
`;

export interface PositionState {
  id: BigNumber;
  token0: Token;
  token1: Token;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: BigNumber;
  pool: Pool;
  feeGrowthInside0LastX128: BigNumber;
  feeGrowthInside1LastX128: BigNumber;
}

export function useQueryPerpOpenOrders(
  chainId: number,
  accounts: string[]
): { loading: boolean; positionStates: PositionState[] } {
  console.count("called use query perp");
  const { loading, error, data } = useQuery(QUERY_OPEN_ORDERS, {
    variables: { accounts },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    client: getPerpClient(chainId),
  });

  if (loading) {
    return { loading: true, positionStates: [] };
  }

  if (error || !data) {
    return { loading: false, positionStates: [] };
  }

  console.log(data);

  return { loading: false, positionStates: [] };
}

export function usePerpV2(chainId: number): {
  loading: boolean;
  pools: PositionState[];
} {
  const { addresses } = useAddress();
  const { loading, positionStates } = useQueryPerpOpenOrders(
    chainId,
    addresses
  );
  return { loading, pools: positionStates };
}
