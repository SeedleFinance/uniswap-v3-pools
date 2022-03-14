import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BigNumber } from "@ethersproject/bignumber";
import { CurrencyAmount, Price, Token } from "@uniswap/sdk-core";
import { Pool, Position as UniPosition } from "@uniswap/v3-sdk";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

import {
  useTransactionTotals,
  useReturnValue,
  useAPR,
  useFeeAPY,
} from "../../hooks/calculations";

import { getPositionStatus, PositionStatus } from "../../utils/positionStatus";

import { useCurrencyConversions } from "../../CurrencyConversionsProvider";
import Transaction from "./Transaction";
import TransferModal from "./TransferModal";
import TokenLabel from "../../ui/TokenLabel";
import RangeVisual from "./RangeVisual";
import Icon from "../../ui/Icon";

export interface PositionProps {
  id: BigNumber;
  pool: Pool;
  baseToken: Token;
  quoteToken: Token;
  entity: UniPosition;
  positionLiquidity?: CurrencyAmount<Token>;
  uncollectedFees: CurrencyAmount<Token>[];
  positionUncollectedFees: CurrencyAmount<Token>;
  priceLower: Price<Token, Token>;
  priceUpper: Price<Token, Token>;
  transactions: any[];
}

function Position({
  id,
  pool,
  baseToken,
  quoteToken,
  entity,
  positionLiquidity,
  uncollectedFees,
  positionUncollectedFees,
  priceLower,
  priceUpper,
  transactions,
}: PositionProps) {
  const { convertToGlobalFormatted, formatCurrencyWithSymbol } =
    useCurrencyConversions();

  const navigate = useNavigate();

  const [showTransactions, setShowTransactions] = useState(false);
  const [expandedUncollectedFees, setExpandedUncollectedFees] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const { percent0, percent1 } = useMemo(() => {
    if (
      !baseToken ||
      !pool ||
      !entity ||
      !positionLiquidity ||
      positionLiquidity.equalTo(0)
    ) {
      return { percent0: "0", percent1: "0" };
    }
    const [value0, value1] = pool.token0.equals(baseToken)
      ? [entity.amount0, pool.priceOf(pool.token1).quote(entity.amount1)]
      : [pool.priceOf(pool.token0).quote(entity.amount0), entity.amount1];
    const calcPercent = (val: CurrencyAmount<Token>) =>
      (
        (parseFloat(val.toSignificant(15)) /
          parseFloat(positionLiquidity.toSignificant(15))) *
        100
      ).toFixed(2);

    return { percent0: calcPercent(value0), percent1: calcPercent(value1) };
  }, [positionLiquidity, entity, pool, baseToken]);

  const totalCurrentValue = useMemo(() => {
    if (!positionLiquidity || positionLiquidity.equalTo(0)) {
      return CurrencyAmount.fromRawAmount(baseToken, 0);
    }

    return positionLiquidity.add(positionUncollectedFees);
  }, [baseToken, positionLiquidity, positionUncollectedFees]);

  const formattedRange = useMemo(() => {
    const prices = priceLower.lessThan(priceUpper)
      ? [priceLower, priceUpper]
      : [priceUpper, priceLower];
    const decimals = Math.min(baseToken.decimals, 8);
    return prices.map((price) => price.toFixed(decimals)).join(" - ");
  }, [priceUpper, priceLower, baseToken]);

  // const formattedAge = useMemo(() => {
  //   const startDate = new Date(transactions[0].timestamp * 1000);
  //   const endDate = BigNumber.from(entity.liquidity.toString()).isZero()
  //     ? new Date(transactions[transactions.length - 1].timestamp * 1000)
  //     : new Date();

  //   return formatDistanceStrict(endDate, startDate);
  // }, [entity.liquidity, transactions]);

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
  } = useTransactionTotals(transactions, baseToken, pool);

  const { returnValue, returnPercent } = useReturnValue(
    baseToken,
    totalMintValue,
    totalBurnValue,
    totalCollectValue,
    totalTransactionCost,
    totalCurrentValue
  );

  const apr = useAPR(
    transactions,
    returnPercent,
    BigNumber.from(entity.liquidity.toString())
  );

  const feeAPY = useFeeAPY(pool, baseToken, uncollectedFees, transactions);

  const statusLabel = useMemo(() => {
    const labels = {
      [PositionStatus.Inactive]: "Closed",
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

  const isPerp = baseToken.symbol === "vUSD";

  const handlePerp = () => {
    setShowActions(false);
    const url = "https://app.perp.com";
    window.open(url);
  };

  const handleRemove = () => {
    setShowActions(false);
    const url = `https://app.uniswap.org/#/pool/${id}`;
    window.open(url);
  };

  const handleTransactions = () => {
    setShowActions(false);
    setShowTransactions(!showTransactions);
  };

  const handleAddLiquidity = () => {
    navigate(
      `/add/${quoteToken.symbol}/${baseToken.symbol}/${pool.fee}?position=${id}`
    );
  };

  const handleTransfer = () => {
    setShowActions(false);
    setShowTransfer(!showTransfer);
  };

  const onTransferCancel = () => {
    setShowTransfer(false);
  };

  const onTransferComplete = (address: string) => {
    setShowTransfer(false);
    console.log(address);
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
        <td className="flex flex-col justify-between border-t border-slate-200 dark:border-slate-700 py-4">
          <div className="text-lg font-bold">{formattedRange}</div>
          <div className={`text-md ${getStatusColor(positionStatus)}`}>
            {statusLabel}{" "}
          </div>
          <RangeVisual
            tickCurrent={pool.tickCurrent}
            tickLower={entity.tickLower}
            tickUpper={entity.tickUpper}
            tickSpacing={pool.tickSpacing}
            flip={pool.token0.equals(baseToken)}
          />
        </td>
        <td className="border-t border-slate-200 dark:border-slate-700 py-4">
          <div>
            <TokenLabel symbol={pool.token0.symbol} />:{" "}
            {entity.amount0.toSignificant(4)}({percent0}%)
          </div>
          <div>
            <TokenLabel symbol={pool.token1.symbol} />:{" "}
            {entity.amount1.toSignificant(4)}({percent1}%)
          </div>
        </td>
        <td className="border-t border-slate-200 dark:border-slate-700 py-4">
          <div>
            {positionLiquidity
              ? convertToGlobalFormatted(positionLiquidity)
              : formatCurrencyWithSymbol(0, 1)}
          </div>
        </td>
        <td className="border-t  border-slate-200 dark:border-slate-700 py-4">
          <div className="flex flex-col items-start justify-center">
            <button
              style={{ borderBottom: "1px dotted" }}
              onClick={() =>
                setExpandedUncollectedFees(!expandedUncollectedFees)
              }
            >
              {convertToGlobalFormatted(positionUncollectedFees)}
            </button>
            {expandedUncollectedFees ? (
              <div className="flex flex-col text-sm">
                <div>
                  {uncollectedFees[0]?.toFixed(6)}{" "}
                  <TokenLabel symbol={pool.token0.symbol} />
                </div>
                <div>
                  {uncollectedFees[1]?.toFixed(6)}{" "}
                  <TokenLabel symbol={pool.token1.symbol} />
                </div>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </td>
        <td className="border-t  border-slate-200 dark:border-slate-700 py-4">
          <div className={feeAPY < 0 ? "text-red-500" : "text-green-500"}>
            {feeAPY.toFixed(2)}%
          </div>
        </td>

        <td className="border-t  border-slate-200 dark:border-slate-700 py-4">
          <div
            className={
              returnValue.lessThan(0) ? "text-red-500" : "text-green-500"
            }
          >
            {convertToGlobalFormatted(returnValue)}
          </div>
        </td>
        <td className="border-t  border-slate-200 dark:border-slate-700 py-4">
          <div className={apr < 0 ? "text-red-500" : "text-green-500"}>
            {apr.toFixed(2)}%
          </div>
        </td>

        <td className="border-t  border-slate-200 dark:border-slate-700 py-4">
          <div className="flex my-2 justify-end relative">
            <button
              className="text-slate-500 dark:text-slate-200 mr-2"
              onClick={() => setShowActions(!showActions)}
            >
              <Icon size="lg" icon={faEllipsis} />
            </button>
            {showActions && (
              <div className="absolute z-50 p-2 rounded-md border border-slate-200 dark:border-slate-700  bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 top-8 w-32 flex flex-col">
                <button className="text-left my-1" onClick={handleTransactions}>
                  Transactions
                </button>
                {isPerp ? (
                  <button className="text-left my-1" onClick={handlePerp}>
                    Manage
                  </button>
                ) : (
                  <>
                    <button
                      className="text-left my-1"
                      onClick={handleAddLiquidity}
                    >
                      Add Liquidity
                    </button>
                    {/*
                    <button className="text-left my-1" onClick={}>
                      Collect fees
                    </button>
                    */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-1 mt-1">
                      {/*
                      <button className="text-left my-1" onClick={}>
                        Reposition
                      </button>
                      */}
                      <button
                        className="text-left my-1"
                        onClick={handleTransfer}
                      >
                        Transfer
                      </button>
                      <button
                        className="text-left text-red-500 my-1"
                        onClick={handleRemove}
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
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
                  baseToken={baseToken}
                  {...tx}
                />
              ))}
            </table>
          </td>
        </tr>
      )}

      {showTransfer && (
        <TransferModal
          id={id}
          onCancel={onTransferCancel}
          onComplete={onTransferComplete}
        />
      )}
    </>
  );
}

export default Position;
