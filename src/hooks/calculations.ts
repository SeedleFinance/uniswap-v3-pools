import { useMemo } from "react";
import differenceInSeconds from "date-fns/differenceInSeconds";
import { BigNumber } from "@ethersproject/bignumber";
import { WETH9, CurrencyAmount, Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";

import { useEthToQuote } from "./useUSDConversion";
import { useChainId } from "./useChainId";

export function useTransactionTotals(
  transactions: any[],
  baseToken: Token,
  pool: Pool
) {
  const chainId = useChainId();

  return useMemo(() => {
    let totalMintValue = CurrencyAmount.fromRawAmount(baseToken, 0);
    let totalBurnValue = CurrencyAmount.fromRawAmount(baseToken, 0);
    let totalCollectValue = CurrencyAmount.fromRawAmount(baseToken, 0);
    let totalTransactionCost = CurrencyAmount.fromRawAmount(
      WETH9[chainId as number],
      "0"
    );

    if (transactions.length && baseToken && pool && chainId) {
      transactions.forEach((tx) => {
        const txValue = pool.token0.equals(baseToken)
          ? pool.priceOf(pool.token1).quote(tx.amount1).add(tx.amount0)
          : pool.priceOf(pool.token0).quote(tx.amount0).add(tx.amount1);
        if (tx.type === "mint") {
          totalMintValue = totalMintValue.add(txValue);
        } else if (tx.type === "burn") {
          totalBurnValue = totalBurnValue.add(txValue);
        } else if (tx.type === "collect") {
          totalCollectValue = totalCollectValue.add(txValue);
        }

        // add gas costs
        totalTransactionCost = totalTransactionCost.add(tx.gas.costCurrency);
      });
    }

    return {
      totalMintValue,
      totalBurnValue,
      totalCollectValue,
      totalTransactionCost,
    };
  }, [transactions, baseToken, pool, chainId]);
}

export function useReturnValue(
  baseToken: Token,
  totalMintValue: CurrencyAmount<Token>,
  totalBurnValue: CurrencyAmount<Token>,
  totalCollectValue: CurrencyAmount<Token>,
  totalTransactionCost: CurrencyAmount<Token>,
  totalCurrentValue: CurrencyAmount<Token>
) {
  const convertEthToQuote = useEthToQuote(baseToken);

  return useMemo(() => {
    const returnValue = totalCurrentValue
      .add(totalBurnValue)
      .add(totalCollectValue)
      .subtract(totalMintValue)
      .subtract(convertEthToQuote(totalTransactionCost));

    const returnPercent =
      (parseFloat(returnValue.toSignificant(2)) /
        parseFloat(
          totalMintValue
            .add(convertEthToQuote(totalTransactionCost))
            .toSignificant(2)
        )) *
      100;

    return { returnValue, returnPercent };
  }, [
    totalMintValue,
    totalBurnValue,
    totalCollectValue,
    totalTransactionCost,
    totalCurrentValue,
    convertEthToQuote,
  ]);
}

export function useAPR(
  transactions: any,
  returnPercent: number,
  liquidity: BigNumber
) {
  return useMemo(() => {
    if (!transactions.length) {
      return 0;
    }

    const startDate = new Date(transactions[0].timestamp * 1000);
    const endDate = liquidity.isZero()
      ? new Date(transactions[transactions.length - 1].timestamp * 1000)
      : new Date();
    const secondsSince = differenceInSeconds(endDate, startDate);
    const yearInSeconds = 365 * 24 * 60 * 60;
    return (returnPercent / secondsSince) * yearInSeconds;
  }, [returnPercent, transactions, liquidity]);
}
