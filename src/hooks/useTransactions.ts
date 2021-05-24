import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useWeb3React } from "@web3-react/core";
import { formatEther } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import {
  WETH9,
  ChainId,
  CurrencyAmount,
  Token,
  Currency,
} from "@uniswap/sdk-core";

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

    collects(where: { owner: $origin, pool: $poolAddress }) {
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
  amount0: CurrencyAmount<Currency>;
  amount1: CurrencyAmount<Currency>;
  gas: {
    price: BigNumber;
    used: BigNumber;
    cost: BigNumber;
    costFormatted: string;
    costUSD: string;
  };
}

export function useTransactions(
  poolAddress: string | null,
  token0: Token | null,
  token1: Token | null
) {
  const { account, chainId } = useWeb3React();

  const getUSDValue = useUSDConversion(WETH9[chainId as ChainId]);

  const { loading, error, data } = useQuery(QUERY_MINTS_BURNS, {
    variables: { origin: account, poolAddress },
    fetchPolicy: "network-only",
  });

  if (loading || error || !data || !token0 || !token1) {
    return [];
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
      gas: calcGasCost(transaction),
      amount0: CurrencyAmount.fromRawAmount(
        token0,
        Math.ceil(parseFloat(amount0) * Math.pow(10, token0.decimals))
      ),
      amount1: CurrencyAmount.fromRawAmount(
        token1,
        Math.ceil(parseFloat(amount1) * Math.pow(10, token1.decimals))
      ),
    });
  };

  const mints = data.mints.map(formatTx("mint"));
  const burns = data.burns.map(formatTx("burn"));
  const collects = data.burns.map(formatTx("collect"));

  return [...mints, ...burns, collects];
}
