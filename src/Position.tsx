import React, { useMemo, useState } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { CurrencyAmount, Price, Token as UniToken } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";

import { usePosition } from "./hooks/usePosition";
import { usePositionFees } from "./hooks/usePositionFees";
import { useUSDConversion } from "./hooks/useUSDConversion";

import { getPositionStatus, PositionStatus } from "./utils/positionStatus";

import Transaction from "./Transaction";
import Token from "./Token";
import RangeVisual from "./RangeVisual";

export interface PositionProps {
  id: BigNumber;
  pool: Pool;
  quoteToken: UniToken;
  tickLower: number;
  tickUpper: number;
  liquidity: BigNumber;
  priceLower: Price<UniToken, UniToken>;
  priceUpper: Price<UniToken, UniToken>;
  transactions: any[];
}

function Position({
  id,
  pool,
  quoteToken,
  tickLower,
  tickUpper,
  liquidity,
  priceLower,
  priceUpper,
  transactions,
}: PositionProps) {
  const position = usePosition(
    pool,
    liquidity.toString(),
    tickLower,
    tickUpper
  );

  const getUSDValue = useUSDConversion(quoteToken);

  const uncollectedFees = usePositionFees(pool, id);

  const totalLiquidity = useMemo(() => {
    if (!quoteToken || !pool || !position) {
      return 0;
    }
    return pool.token0.equals(quoteToken)
      ? pool.priceOf(pool.token1).quote(position.amount1).add(position.amount0)
      : pool.priceOf(pool.token0).quote(position.amount0).add(position.amount1);
  }, [quoteToken, pool, position]);

  const [showTransactions, setShowTransactions] = useState(false);
  const [expandedUncollectedFees, setExpandedUncollectedFees] = useState(false);

  const { percent0, percent1 } = useMemo(() => {
    if (
      !quoteToken ||
      !pool ||
      !position ||
      totalLiquidity === 0 ||
      totalLiquidity.equalTo(0)
    ) {
      return { percent0: "0", percent1: "0" };
    }
    const [value0, value1] = pool.token0.equals(quoteToken)
      ? [position.amount0, pool.priceOf(pool.token1).quote(position.amount1)]
      : [pool.priceOf(pool.token0).quote(position.amount0), position.amount1];
    const calcPercent = (val: CurrencyAmount<UniToken>) =>
      (
        (parseFloat(val.toSignificant(15)) /
          parseFloat(totalLiquidity.toSignificant(15))) *
        100
      ).toFixed(2);

    return { percent0: calcPercent(value0), percent1: calcPercent(value1) };
  }, [totalLiquidity, position, pool, quoteToken]);

  const totalUncollectedFees = useMemo(() => {
    if (!quoteToken || !pool || !uncollectedFees[0] || !uncollectedFees[1]) {
      return 0;
    }
    return pool.token0.equals(quoteToken)
      ? pool
          .priceOf(pool.token1)
          .quote(uncollectedFees[1])
          .add(uncollectedFees[0])
      : pool
          .priceOf(pool.token0)
          .quote(uncollectedFees[0])
          .add(uncollectedFees[1]);
  }, [quoteToken, pool, uncollectedFees]);

  const totalValue = useMemo(() => {
    if (totalLiquidity === 0 || totalUncollectedFees === 0) {
      return 0;
    }

    return totalLiquidity.add(totalUncollectedFees);
  }, [totalLiquidity, totalUncollectedFees]);

  const formattedRange = useMemo(() => {
    const prices = priceLower.lessThan(priceUpper)
      ? [priceLower, priceUpper]
      : [priceUpper, priceLower];
    const decimals = Math.min(quoteToken.decimals, 8);
    return prices.map((price) => price.toFixed(decimals)).join(" - ");
  }, [priceUpper, priceLower, quoteToken]);

  const positionStatus = useMemo((): PositionStatus => {
    if (!pool) {
      return PositionStatus.Inactive;
    }

    return getPositionStatus(pool.tickCurrent, {
      tickUpper,
      tickLower,
      liquidity,
    });
  }, [pool, tickLower, tickUpper, liquidity]);

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

  if (!pool || !position) {
    return null;
  }

  return (
    <>
      <tr
        className={
          positionStatus === PositionStatus.Inactive ? "text-gray-500" : ""
        }
      >
        <td>
          <div className="text-lg font-bold">{formattedRange}</div>
          <div className={`text-md ${getStatusColor(positionStatus)}`}>
            {statusLabel}{" "}
          </div>
          <RangeVisual
            tickCurrent={pool.tickCurrent}
            tickLower={tickLower}
            tickUpper={tickUpper}
          />
        </td>
        <td>
          <div>
            <Token symbol={pool.token0.symbol} />:{" "}
            {position.amount0.toSignificant(4)}({percent0}%)
          </div>
          <div>
            <Token symbol={pool.token1.symbol} />:{" "}
            {position.amount1.toSignificant(4)}({percent1}%)
          </div>
        </td>

        <td>
          <div>USD {getUSDValue(totalLiquidity)}</div>
        </td>
        <td>
          <div>
            <button
              style={{ borderBottom: "1px dotted" }}
              onClick={() =>
                setExpandedUncollectedFees(!expandedUncollectedFees)
              }
            >
              USD {getUSDValue(totalUncollectedFees)}
            </button>
          </div>
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
        </td>
        <td>
          <div>USD {getUSDValue(totalValue)}</div>
        </td>
        <td>
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
