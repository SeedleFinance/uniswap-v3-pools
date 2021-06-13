import React, { useMemo, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import differenceInSeconds from "date-fns/differenceInSeconds";
import formatDistance from "date-fns/formatDistance";
import { BigNumber } from "@ethersproject/bignumber";
import {
  WETH9,
  ChainId,
  CurrencyAmount,
  Price,
  Token as UniToken,
} from "@uniswap/sdk-core";
import { Pool, Position as UniPosition } from "@uniswap/v3-sdk";

import { useUSDConversion, useEthToQuote } from "./hooks/useUSDConversion";

import { getPositionStatus, PositionStatus } from "./utils/positionStatus";
import { formatCurrency } from "./utils/numbers";

import Transaction from "./Transaction";
import Token from "./Token";
import RangeVisual from "./RangeVisual";

export interface PositionProps {
  id: BigNumber;
  pool: Pool;
  quoteToken: UniToken;
  entity: UniPosition;
  positionLiquidity?: CurrencyAmount<UniToken>;
  uncollectedFees: CurrencyAmount<UniToken>[];
  positionUncollectedFees: CurrencyAmount<UniToken>;
  priceLower: Price<UniToken, UniToken>;
  priceUpper: Price<UniToken, UniToken>;
  transactions: any[];
}

function Position({
  id,
  pool,
  quoteToken,
  entity,
  positionLiquidity,
  uncollectedFees,
  positionUncollectedFees,
  priceLower,
  priceUpper,
  transactions,
}: PositionProps) {
  const { chainId } = useWeb3React();
  const getUSDValue = useUSDConversion(quoteToken);
  const convertEthToQuote = useEthToQuote(quoteToken);

  const [showTransactions, setShowTransactions] = useState(false);
  const [expandedUncollectedFees, setExpandedUncollectedFees] = useState(false);

  const { percent0, percent1 } = useMemo(() => {
    if (
      !quoteToken ||
      !pool ||
      !entity ||
      !positionLiquidity ||
      positionLiquidity.equalTo(0)
    ) {
      return { percent0: "0", percent1: "0" };
    }
    const [value0, value1] = pool.token0.equals(quoteToken)
      ? [entity.amount0, pool.priceOf(pool.token1).quote(entity.amount1)]
      : [pool.priceOf(pool.token0).quote(entity.amount0), entity.amount1];
    const calcPercent = (val: CurrencyAmount<UniToken>) =>
      (
        (parseFloat(val.toSignificant(15)) /
          parseFloat(positionLiquidity.toSignificant(15))) *
        100
      ).toFixed(2);

    return { percent0: calcPercent(value0), percent1: calcPercent(value1) };
  }, [positionLiquidity, entity, pool, quoteToken]);

  const totalCurrentValue = useMemo(() => {
    if (
      !positionLiquidity ||
      positionLiquidity.equalTo(0) ||
      positionUncollectedFees.equalTo(0)
    ) {
      return CurrencyAmount.fromRawAmount(quoteToken, 0);
    }

    return positionLiquidity.add(positionUncollectedFees);
  }, [quoteToken, positionLiquidity, positionUncollectedFees]);

  const formattedRange = useMemo(() => {
    const prices = priceLower.lessThan(priceUpper)
      ? [priceLower, priceUpper]
      : [priceUpper, priceLower];
    const decimals = Math.min(quoteToken.decimals, 8);
    return prices.map((price) => price.toFixed(decimals)).join(" - ");
  }, [priceUpper, priceLower, quoteToken]);

  const formattedAge = useMemo(() => {
    const startDate = new Date(transactions[0].timestamp * 1000);
    const endDate = BigNumber.from(entity.liquidity.toString()).isZero()
      ? new Date(transactions[transactions.length - 1].timestamp * 1000)
      : new Date();

    return formatDistance(endDate, startDate);
  }, [entity.liquidity, transactions]);

  const positionStatus = useMemo((): PositionStatus => {
    if (!pool) {
      return PositionStatus.Inactive;
    }

    return getPositionStatus(pool.tickCurrent, entity);
  }, [pool, entity]);

  const {
    totalMintValue,
    totalBurnValue,
    totalCollectValue,
    totalTransactionCost,
  } = useMemo(() => {
    let totalMintValue = CurrencyAmount.fromRawAmount(quoteToken, 0);
    let totalBurnValue = CurrencyAmount.fromRawAmount(quoteToken, 0);
    let totalCollectValue = CurrencyAmount.fromRawAmount(quoteToken, 0);
    let totalTransactionCost = CurrencyAmount.fromRawAmount(
      WETH9[chainId as ChainId],
      "0"
    );

    if (transactions.length && quoteToken && pool && chainId) {
      transactions.forEach((tx) => {
        const txValue = pool.token0.equals(quoteToken)
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
  }, [transactions, quoteToken, pool, chainId]);

  const returnValue = useMemo(() => {
    return totalCurrentValue
      .add(totalBurnValue)
      .add(totalCollectValue)
      .subtract(totalMintValue)
      .subtract(convertEthToQuote(totalTransactionCost));
  }, [
    totalMintValue,
    totalBurnValue,
    totalCollectValue,
    totalTransactionCost,
    totalCurrentValue,
    convertEthToQuote,
  ]);

  const returnPercent = useMemo(() => {
    return (
      (parseFloat(returnValue.toSignificant(2)) /
        parseFloat(
          totalMintValue
            .add(convertEthToQuote(totalTransactionCost))
            .toSignificant(2)
        )) *
      100
    );
  }, [totalMintValue, totalTransactionCost, returnValue, convertEthToQuote]);

  const apr = useMemo(() => {
    if (!transactions.length) {
      return 0;
    }

    const startDate = new Date(transactions[0].timestamp * 1000);
    const endDate = BigNumber.from(entity.liquidity.toString()).isZero()
      ? new Date(transactions[transactions.length - 1].timestamp * 1000)
      : new Date();
    const secondsSince = differenceInSeconds(endDate, startDate);
    const yearInSeconds = 365 * 24 * 60 * 60;
    return (returnPercent / secondsSince) * yearInSeconds;
  }, [returnPercent, transactions, entity.liquidity]);

  const statusLabel = useMemo(() => {
    const labels = {
      [PositionStatus.Inactive]: "Inactive",
      [PositionStatus.InRange]: "In Range",
      [PositionStatus.OutRange]: "Out of Range",
    };
    return labels[positionStatus];
  }, [positionStatus]);

  const getStatusColor = (status: PositionStatus) => {
    const colors = {
      [PositionStatus.Inactive]: "text-gray-500",
      [PositionStatus.InRange]: "text-green-500",
      [PositionStatus.OutRange]: "text-yellow-500",
    };
    return colors[positionStatus];
  };

  if (!pool || !entity) {
    return null;
  }

  return (
    <>
      <tr
        className={
          positionStatus === PositionStatus.Inactive ? "text-gray-500" : ""
        }
      >
        <td className="flex flex-col justify-between border-t border-gray-200 py-4">
          <div className="text-lg font-bold">{formattedRange}</div>
          <div className={`text-md ${getStatusColor(positionStatus)}`}>
            {statusLabel}{" "}
          </div>
          <RangeVisual
            tickCurrent={pool.tickCurrent}
            tickLower={entity.tickLower}
            tickUpper={entity.tickUpper}
            tickSpacing={pool.tickSpacing}
            flip={pool.token0.equals(quoteToken)}
          />
        </td>
        <td className="border-t border-gray-200 py-4">
          <div>
            <Token symbol={pool.token0.symbol} />:{" "}
            {entity.amount0.toSignificant(4)}({percent0}%)
          </div>
          <div>
            <Token symbol={pool.token1.symbol} />:{" "}
            {entity.amount1.toSignificant(4)}({percent1}%)
          </div>
        </td>
        <td className="border-t border-gray-200 py-4">
          <div>{formattedAge}</div>
        </td>
        <td className="border-t border-gray-200 py-4">
          <div>{formatCurrency(getUSDValue(positionLiquidity || 0))}</div>
        </td>
        <td className="border-t border-gray-200 py-4">
          <div className="flex flex-col items-start justify-center">
            <button
              style={{ borderBottom: "1px dotted" }}
              onClick={() =>
                setExpandedUncollectedFees(!expandedUncollectedFees)
              }
            >
              {formatCurrency(getUSDValue(positionUncollectedFees))}
            </button>
            {expandedUncollectedFees ? (
              <div className="flex flex-col text-sm">
                <div>
                  {uncollectedFees[0]?.toFixed(6)}{" "}
                  <Token symbol={pool.token0.symbol} />
                </div>
                <div>
                  {uncollectedFees[1]?.toFixed(6)}{" "}
                  <Token symbol={pool.token1.symbol} />
                </div>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </td>
        <td className="border-t border-gray-200 py-4">
          <div>{formatCurrency(getUSDValue(totalCurrentValue))}</div>
        </td>
        <td className="border-t border-gray-200 py-4">
          <div
            className={
              returnValue.lessThan(0) ? "text-red-500" : "text-green-500"
            }
          >
            {formatCurrency(getUSDValue(returnValue))} (
            {returnPercent.toFixed(2)}%)
          </div>
        </td>
        <td className="border-t border-gray-200 py-4">
          <div className={apr < 0 ? "text-red-500" : "text-green-500"}>
            {apr.toFixed(2)}%
          </div>
        </td>

        <td className="border-t border-gray-200 py-4">
          <div className="flex my-2 justify-end">
            <button
              className="text-blue-500 mr-2"
              onClick={() => {
                setShowTransactions(!showTransactions);
              }}
            >
              Transactions
            </button>
            <button
              className="text-blue-500 mr-2"
              onClick={() => {
                window.open(`https://app.uniswap.org/#/pool/${id}`);
              }}
            >
              Manage
            </button>
          </div>
        </td>
      </tr>
      {showTransactions && (
        <tr>
          <td colSpan={4}>
            <table className="table-auto border-separate w-full my-2">
              <thead>
                <tr className="text-left">
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Distribution</th>
                  <th>Liquidity</th>
                  <th>Gas cost</th>
                </tr>
              </thead>
              {transactions.map((tx: any) => (
                <Transaction
                  key={tx.id}
                  pool={pool}
                  quoteToken={quoteToken}
                  {...tx}
                />
              ))}
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

export default Position;
