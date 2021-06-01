import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "@ethersproject/bignumber";
import {
  WETH9,
  ChainId,
  CurrencyAmount,
  Token,
  Currency,
} from "@uniswap/sdk-core";

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

const QUERY_COLLECTS = gql`
  query collectsByTransactions($ids: [String]!) {
    collects(where: { transaction_in: $ids }) {
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

export interface FormattedPoolTransaction {
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
    costCurrency: CurrencyAmount<Currency>;
  };
}

export function useTransactions(
  poolAddress: string | null,
  token0: Token | null,
  token1: Token | null
) {
  const { account, chainId } = useWeb3React();

  const { loading, error, data } = useQuery(QUERY_MINTS_BURNS, {
    variables: { origin: account, poolAddress },
    fetchPolicy: "network-only",
  });

  const collectData = useCollects(data ? data.burns : []);

  if (loading || error || !data || !token0 || !token1) {
    return [];
  }

  const calcGasCost = (transaction: any) => {
    const used = BigNumber.from(transaction.gasUsed); // Note: graph returns the gas limit instead of gas used
    const price = BigNumber.from(transaction.gasPrice);
    const cost = used.mul(price);
    const costCurrency = CurrencyAmount.fromRawAmount(
      WETH9[chainId as ChainId],
      cost.toString()
    );

    return { used, price, cost, costCurrency };
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
  const collects = collectData.map(formatTx("collect"));

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
      tx.type === "burn" &&
      tx.amount0.equalTo(0) &&
      tx.amount1.equalTo(0)
    ) {
      // an empty burn, this will be followed by a collect. Don't include this tx.
      return [...accm];
    } else if (tx.type === "collect") {
      // burn with liquidity + fees
      // reset the gas cost (already included in the burn)
      tx.gas = {
        ...tx.gas,
        cost: BigNumber.from(0),
        costCurrency: CurrencyAmount.fromRawAmount(
          WETH9[chainId as ChainId],
          "0"
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

export function useCollects(burns: any[]) {
  const ids = burns.map(({ transaction }) => transaction.id);
  const { loading, error, data } = useQuery(QUERY_COLLECTS, {
    variables: { ids },
    fetchPolicy: "network-only",
  });

  if (loading || error || !data) {
    return [];
  }

  return data.collects;
}
