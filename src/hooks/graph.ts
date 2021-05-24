import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useWeb3React } from "@web3-react/core";
import { formatEther } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { WETH9, ChainId, CurrencyAmount } from "@uniswap/sdk-core";

import { useUSDConversion } from "./useUSDConversion";

const QUERY_MINTS_BURNS = gql`
  query mints_burns($origin: String!, $poolAddress: String!) {
    mints(where: { origin: $origin, pool: $poolAddress }) {
      tickLower
      tickUpper
      timestamp
      amount0
      amount1
      transaction {
        id
        gasUsed
        gasPrice
      }
    }

    burns(where: { origin: $origin, pool: $poolAddress }) {
      tickLower
      tickUpper
      timestamp
      amount0
      amount1
      transaction {
        id
        gasUsed
        gasPrice
      }
    }
  }
`;

interface PoolTransactionResponse {
  tickLower: string;
  tickUpper: string;
  timestamp: string;
  amount0: string;
  amount1: string;
  transaction: { id: string; gasUsed: string; gasPrice: string };
}

interface FormattedPoolTransaction {
  id: string;
  type: string;
  tickLower: number;
  tickUpper: number;
  timestamp: number;
  amount0: number;
  amount1: number;
  gas: {
    price: BigNumber;
    used: BigNumber;
    cost: BigNumber;
    costFormatted: string;
    costUSD: string;
  };
}

export function useFetchPoolTransactions(poolAddress: string | null) {
  const { account, chainId } = useWeb3React();
  const getUSDValue = useUSDConversion(WETH9[chainId as ChainId]);

  const { loading, error, data } = useQuery(QUERY_MINTS_BURNS, {
    variables: { origin: account, poolAddress },
    fetchPolicy: "network-only",
  });

  if (loading || error || !data) {
    return { mints: [], burns: [] };
  }

  const calcGasCost = (transaction: any) => {
    const used = BigNumber.from(transaction.gasUsed); // Note: graph returns the gas limit instead of gas used
    const price = BigNumber.from(transaction.gasPrice);
    const cost = used.mul(price);
    const costFormatted = formatEther(cost);
    const costUSD = getUSDValue(
      CurrencyAmount.fromRawAmount(WETH9[chainId as ChainId], cost.toString())
    );

    return { used, price, cost, costFormatted, costUSD };
  };

  const formatTx = (type: string) => {
    return ({
      tickLower,
      tickUpper,
      timestamp,
      amount0,
      amount1,
      transaction,
    }: PoolTransactionResponse): FormattedPoolTransaction => ({
      id: transaction.id,
      type,
      tickLower: parseInt(tickLower, 10),
      tickUpper: parseInt(tickUpper, 10),
      timestamp: parseInt(timestamp, 10),
      amount0: parseFloat(amount0),
      amount1: parseFloat(amount1),
      gas: calcGasCost(transaction),
    });
  };

  const mints = data.mints.map(formatTx("mint"));
  const burns = data.burns.map(formatTx("burn"));

  return { mints, burns };
}
