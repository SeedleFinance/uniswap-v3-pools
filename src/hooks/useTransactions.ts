import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { BigNumber } from "@ethersproject/bignumber";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";

import { useAddress } from "../providers/AddressProvider";
import { getClient } from "../lib/apollo";
import { WETH9, MATIC } from "../common/constants";
import { TxTypes } from "../types/enums";

const QUERY_MINTS_BURNS = gql`
  query mints_burns($origins: [String]!, $poolAddresses: [String]!) {
    mints(
      first: 1000
      orderBy: timestamp
      orderDirection: desc
      where: { origin_in: $origins, pool_in: $poolAddresses }
    ) {
      tickLower
      tickUpper
      timestamp
      pool {
        id
      }
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
      amount0
      amount1
      transaction {
        id
        gasUsed
        gasPrice
      }
    }

    burns(
      first: 1000
      orderBy: timestamp
      orderDirection: desc
      where: { origin_in: $origins, pool_in: $poolAddresses }
    ) {
      tickLower
      tickUpper
      timestamp
      pool {
        id
      }
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

const QUERY_COLLECTS = gql`
  query collectsByTransactions($ids: [String]!) {
    collects(
      first: 1000
      orderBy: timestamp
      orderDirection: desc
      where: { transaction_in: $ids }
    ) {
      tickLower
      tickUpper
      timestamp
      pool {
        id
      }
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
  pool: { id: string };
  token0: { id: string; name: string; symbol: string; decimals: string };
  token1: { id: string; name: string; symbol: string; decimals: string };
  amount0: string;
  amount1: string;
  transaction: { id: string; gasUsed: string; gasPrice: string };
}

export interface FormattedPoolTransaction {
  id: string;
  transactionHash: string;
  poolAddress: string;
  transactionType: TxTypes;
  tickLower: number;
  tickUpper: number;
  timestamp: number;
  amount0: CurrencyAmount<Token>;
  amount1: CurrencyAmount<Token>;
  gas: {
    price: BigNumber;
    used: BigNumber;
    cost: BigNumber;
    costCurrency: CurrencyAmount<Token>;
  };
}

export function useTransactions(chainId: number, poolAddresses: string[]) {
  const { addresses } = useAddress();

  const { loading, error, data } = useQuery(QUERY_MINTS_BURNS, {
    variables: { origins: addresses, poolAddresses },
    fetchPolicy: "network-only",
    client: getClient(chainId),
  });

  const collectData = useCollects(chainId, data ? data.burns : []);

  if (loading || error || !data) {
    return [];
  }

  const calcGasCost = (transaction: any) => {
    const used = BigNumber.from(transaction.gasUsed); // Note: graph returns the gas limit instead of gas used
    const price = BigNumber.from(transaction.gasPrice);
    const cost = used.mul(price);
    const costCurrency = CurrencyAmount.fromRawAmount(
      chainId === 137 ? MATIC[chainId] : WETH9[chainId],
      cost.toString()
    );

    return { used, price, cost, costCurrency };
  };

  const formatTx = (type: TxTypes) => {
    return ({
      tickLower,
      tickUpper,
      timestamp,
      pool,
      token0,
      token1,
      amount0,
      amount1,
      transaction,
    }: PoolTransactionResponse): FormattedPoolTransaction => ({
      id: transaction.id,
      transactionHash: transaction.id,
      transactionType: type,
      tickLower: parseInt(tickLower, 10),
      tickUpper: parseInt(tickUpper, 10),
      timestamp: parseInt(timestamp, 10),
      poolAddress: pool.id,
      gas: calcGasCost(transaction),
      amount0: CurrencyAmount.fromRawAmount(
        new Token(
          chainId,
          token0.id,
          parseInt(token0.decimals, 10),
          token0.symbol,
          token0.name
        ),
        Math.ceil(
          parseFloat(amount0) * Math.pow(10, parseInt(token0.decimals, 10))
        )
      ),
      amount1: CurrencyAmount.fromRawAmount(
        new Token(
          chainId,
          token1.id,
          parseInt(token1.decimals, 10),
          token1.symbol,
          token1.name
        ),
        Math.ceil(
          parseFloat(amount1) * Math.pow(10, parseInt(token1.decimals, 10))
        )
      ),
    });
  };

  const mints = data.mints.map(formatTx(TxTypes.Add));
  const burns = data.burns.map(formatTx(TxTypes.Remove));
  const collects = collectData.map(formatTx(TxTypes.Collect));

  const reconcileBurnsAndCollects = (
    accm: FormattedPoolTransaction[],
    tx: FormattedPoolTransaction
  ) => {
    const prevTxIdx = accm.findIndex((ptx) => ptx.id === tx.id);
    // no previous tx found, returning early
    if (prevTxIdx === -1) {
      return [...accm, tx];
    }

    const prevTx = accm[prevTxIdx];

    // Burn transaction with 0 liquidity, this means no liquidity was burnt only fees collected.
    // Remove the transaction from the list
    if (prevTx.amount0.equalTo(0) && prevTx.amount1.equalTo(0)) {
      accm.splice(prevTxIdx, 1);
    } else if (
      tx.transactionType === TxTypes.Remove &&
      tx.amount0.equalTo(0) &&
      tx.amount1.equalTo(0)
    ) {
      // an empty burn, this will be followed by a collect. Don't include this tx.
      return [...accm];
    } else if (tx.transactionType === TxTypes.Collect) {
      // burn with liquidity + fees
      // reset the gas cost (already included in the burn)
      tx.gas = {
        ...tx.gas,
        cost: BigNumber.from(0),
        costCurrency: CurrencyAmount.fromRawAmount(
          chainId === 137 ? MATIC[chainId] : WETH9[chainId],
          0
        ),
      };

      // subtract the burn amount to get only the fees collected
      tx.amount0 = tx.amount0.subtract(prevTx.amount0);
      tx.amount1 = tx.amount1.subtract(prevTx.amount1);
    }

    return [...accm, tx];
  };

  return [...mints, ...burns, ...collects]
    .reduce(reconcileBurnsAndCollects, [] as FormattedPoolTransaction[])
    .sort(
      (a: FormattedPoolTransaction, b: FormattedPoolTransaction) =>
        a.timestamp - b.timestamp
    );
}

export function useCollects(chainId: number, burns: any[]) {
  const ids = burns.map(({ transaction }) => transaction.id);
  const { loading, error, data } = useQuery(QUERY_COLLECTS, {
    variables: { ids },
    fetchPolicy: "network-only",
    client: getClient(chainId),
  });

  if (loading || error || !data) {
    return [];
  }

  return data.collects;
}
