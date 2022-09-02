import { useMemo } from "react";
import differenceInSeconds from "date-fns/differenceInSeconds";
import { BigNumber } from "@ethersproject/bignumber";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";

import { useGasFee } from "./useGasFee";
import { WETH9, MATIC } from "../common/constants";
import { TxTypes } from "../types/enums";

export function useTransactionTotals(
  transactions: any[],
  baseToken: Token,
  pool: Pool
) {
  const chainId = baseToken.chainId;

  return useMemo(() => {
    let totalMintValue = CurrencyAmount.fromRawAmount(baseToken, 0);
    let totalBurnValue = CurrencyAmount.fromRawAmount(baseToken, 0);
    let totalCollectValue = CurrencyAmount.fromRawAmount(baseToken, 0);
    let totalTransactionCost = CurrencyAmount.fromRawAmount(
      chainId === 137 ? MATIC[chainId as number] : WETH9[chainId as number],
      "0"
    );

    if (transactions.length && baseToken && pool && chainId) {
      transactions.forEach((tx) => {
        const txValue = pool.token0.equals(baseToken)
          ? pool.priceOf(pool.token1).quote(tx.amount1).add(tx.amount0)
          : pool.priceOf(pool.token0).quote(tx.amount0).add(tx.amount1);
        if (tx.transactionType === TxTypes.Add) {
          totalMintValue = totalMintValue.add(txValue);
        } else if (tx.transactionType === TxTypes.Remove) {
          totalBurnValue = totalBurnValue.add(txValue);
        } else if (tx.transactionType === TxTypes.Collect) {
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
  const convertGasFee = useGasFee(baseToken);

  return useMemo(() => {
    const totalTransactionCostConverted = convertGasFee(totalTransactionCost);
    const returnValue = totalCurrentValue
      .add(totalBurnValue)
      .add(totalCollectValue)
      .subtract(totalMintValue)
      .subtract(totalTransactionCostConverted);

    const returnPercent =
      (parseFloat(returnValue.toSignificant(2)) /
        parseFloat(
          totalMintValue.add(totalTransactionCostConverted).toSignificant(2)
        )) *
      100;

    return { returnValue, returnPercent };
  }, [
    totalMintValue,
    totalBurnValue,
    totalCollectValue,
    totalTransactionCost,
    totalCurrentValue,
    convertGasFee,
  ]);
}

export function useAPR(
  transactions: any[],
  returnPercent: number,
  liquidity: BigNumber
) {
  return useMemo(() => {
    if (!transactions.length) {
      return 0;
    }

    const sortedTxs = transactions.sort(
      (a: any, b: any) => a.timestamp - b.timestamp
    );
    const startDate = new Date(sortedTxs[0].timestamp * 1000);
    const endDate = liquidity.isZero()
      ? new Date(sortedTxs[sortedTxs.length - 1].timestamp * 1000)
      : new Date();
    const secondsSince = differenceInSeconds(endDate, startDate);
    const yearInSeconds = 365 * 24 * 60 * 60;
    return (returnPercent / secondsSince) * yearInSeconds;
  }, [returnPercent, transactions, liquidity]);
}

function calcLiquidity(
  pool: Pool,
  baseToken: Token,
  amount0: CurrencyAmount<Token>,
  amount1: CurrencyAmount<Token>
) {
  return pool.token0.equals(baseToken)
    ? pool.priceOf(pool.token1).quote(amount1).add(amount0)
    : pool.priceOf(pool.token0).quote(amount0).add(amount1);
}

function calcPeriodYield(
  fees: CurrencyAmount<Token>,
  liquidity: CurrencyAmount<Token>,
  periodStart: Date,
  periodEnd: Date
) {
  const zeroAmount = CurrencyAmount.fromRawAmount(liquidity.currency, 0);
  if (liquidity.equalTo(zeroAmount)) {
    return zeroAmount;
  }
  const periodYield = fees.divide(liquidity).multiply(liquidity.decimalScale);
  let secondsSince = differenceInSeconds(periodEnd, periodStart);
  if (secondsSince === 0) {
    return zeroAmount;
  }
  return periodYield.divide(secondsSince);
}

function calculateFeeAPY(
  pool: Pool,
  baseToken: Token,
  uncollectedFees: CurrencyAmount<Token>[],
  transactions: any[],
): number {
  const zeroAmount = CurrencyAmount.fromRawAmount(baseToken, 0);

  if (!transactions.length) {
    return 0;
  }

  const sortedTxs = transactions.sort((a: any, b: any) => a.timestamp - b.timestamp);

  const periodYieldsPerSecond = [];
  let periodLiquidityAdded = zeroAmount;
  let periodLiquidityRemoved = zeroAmount;
  let periodStart = new Date();

  sortedTxs.forEach(
    ({
      transactionType,
      amount0,
      amount1,
      timestamp,
    }: {
      transactionType: TxTypes;
      amount0: CurrencyAmount<Token>;
      amount1: CurrencyAmount<Token>;
      timestamp: number;
    }) => {
      let liquidity = calcLiquidity(pool, baseToken, amount0, amount1);
      if (transactionType === TxTypes.Add) {
        if (periodLiquidityAdded.lessThan(zeroAmount) || periodLiquidityAdded.equalTo(zeroAmount)) {
          periodStart = new Date(timestamp * 1000);
        }
        periodLiquidityAdded = periodLiquidityAdded.add(liquidity);
      } else if (transactionType === TxTypes.Remove) {
        periodLiquidityRemoved = periodLiquidityRemoved.add(liquidity);
      } else if (transactionType === TxTypes.Collect) {
        const periodEnd = new Date(timestamp * 1000);
        const periodYield = calcPeriodYield(
          liquidity,
          periodLiquidityAdded,
          periodStart,
          periodEnd,
        );
        periodYieldsPerSecond.push(periodYield);

        // reset period
        periodLiquidityAdded = periodLiquidityAdded.subtract(periodLiquidityRemoved);
        periodLiquidityRemoved = zeroAmount;
        periodStart = periodEnd;
      }
    },
  );

  // calculate uncollected fee yield
  const totalUncollectedFees =
    uncollectedFees.length > 1
      ? calcLiquidity(pool, baseToken, uncollectedFees[0], uncollectedFees[1])
      : uncollectedFees[0];
  if (!totalUncollectedFees.equalTo(zeroAmount)) {
    const uncollectedYield = calcPeriodYield(
      totalUncollectedFees,
      periodLiquidityAdded,
      periodStart,
      new Date(),
    );
    periodYieldsPerSecond.push(uncollectedYield);
  }

  let totalYield = CurrencyAmount.fromRawAmount(baseToken, 0);
  periodYieldsPerSecond.forEach((y) => (totalYield = totalYield.add(y)));

  if (!periodYieldsPerSecond.length) {
    return 0;
  }

  const yearInSeconds = 365 * 24 * 60 * 60;
  return parseFloat(
    totalYield
      .divide(periodYieldsPerSecond.length)
      .multiply(yearInSeconds)
      .multiply(100)
      .toFixed(2),
  );
}

export function useFeeAPY(
  pool: Pool,
  baseToken: Token,
  uncollectedFees: CurrencyAmount<Token>[],
  transactions: any[]
) {
  return useMemo(() => {
    return calculateFeeAPY(pool, baseToken, uncollectedFees, transactions);
  }, [transactions, pool, baseToken, uncollectedFees]);
}

export function usePoolFeeAPY(pool: Pool, baseToken: Token, positions: any[]) {
  return useMemo(() => {
    if (!positions || !positions.length) {
      return 0;
    }

    const totalAPY = positions.reduce((accm, position) => {
      return (
        accm + calculateFeeAPY(pool, baseToken, position.uncollectedFees, position.transactions)
      );
    }, 0);

    return totalAPY / positions.length;
  }, [positions, pool, baseToken]);
}
