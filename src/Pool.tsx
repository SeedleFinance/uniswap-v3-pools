import React, { useMemo, useState } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { useWeb3React } from "@web3-react/core";
import {
  ChainId,
  WETH9,
  Token as UniToken,
  Price,
  CurrencyAmount,
} from "@uniswap/sdk-core";
import {
  tickToPrice,
  Pool as UniPool,
  Position as UniPosition,
} from "@uniswap/v3-sdk";
import differenceInSeconds from "date-fns/differenceInSeconds";

import { useUSDConversion, useEthToQuote } from "./hooks/useUSDConversion";
import {
  useTransactions,
  FormattedPoolTransaction,
} from "./hooks/useTransactions";

import { formatCurrency } from "./utils/numbers";

import Token from "./Token";
import Position from "./Position";
import PositionStatuses from "./PositionStatuses";

interface PoolProps {
  address: string;
  entity: UniPool;
  quoteToken: UniToken;
  baseToken: UniToken;
  rawLiquidity: BigNumber;
  liquidity: CurrencyAmount<UniToken>;
  poolUncollectedFees: CurrencyAmount<UniToken>;
  positions: {
    id: BigNumber;
    entity: UniPosition;
    priceLower?: Price<UniToken, UniToken>;
    priceUpper?: Price<UniToken, UniToken>;
    positionLiquidity?: CurrencyAmount<UniToken>;
    uncollectedFees: CurrencyAmount<UniToken>[];
    positionUncollectedFees: CurrencyAmount<UniToken>;
  }[];
}

function Pool({
  address,
  entity,
  quoteToken,
  baseToken,
  positions,
  liquidity,
  rawLiquidity,
  poolUncollectedFees,
}: PoolProps) {
  const { chainId } = useWeb3React();

  const getUSDValue = useUSDConversion(quoteToken);
  const convertEthToQuote = useEthToQuote(quoteToken);
  const { token0, token1 } = entity;

  const transactions: FormattedPoolTransaction[] = useTransactions(
    address,
    token0,
    token1
  );

  const [showPositions, setShowPositions] = useState(false);

  const poolPrice = useMemo(() => {
    if (!baseToken || !entity) {
      return 0;
    }

    return entity.priceOf(baseToken);
  }, [baseToken, entity]);

  const totalValue = useMemo(() => {
    return liquidity.add(poolUncollectedFees);
  }, [liquidity, poolUncollectedFees]);

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

    if (transactions.length && quoteToken && entity && chainId) {
      transactions.forEach((tx) => {
        const txValue = token0.equals(quoteToken)
          ? entity.priceOf(token1).quote(tx.amount1).add(tx.amount0)
          : entity.priceOf(token0).quote(tx.amount0).add(tx.amount1);
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
  }, [transactions, quoteToken, entity, token0, token1, chainId]);

  const returnValue = useMemo(() => {
    return totalValue
      .add(totalBurnValue)
      .add(totalCollectValue)
      .subtract(totalMintValue)
      .subtract(convertEthToQuote(totalTransactionCost));
  }, [
    totalMintValue,
    totalBurnValue,
    totalCollectValue,
    totalTransactionCost,
    totalValue,
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
    const endDate = rawLiquidity.isZero()
      ? new Date(transactions[transactions.length - 1].timestamp * 1000)
      : new Date();
    const secondsSince = differenceInSeconds(endDate, startDate);
    const yearInSeconds = 365 * 24 * 60 * 60;
    return (returnPercent / secondsSince) * yearInSeconds;
  }, [returnPercent, transactions, rawLiquidity]);

  const positionsWithPricesAndTransactions = useMemo(() => {
    if (!positions || !positions.length || !baseToken || !quoteToken) {
      return [];
    }

    return positions.map((position) => {
      const priceLower = tickToPrice(
        baseToken,
        quoteToken,
        position.entity.tickLower
      );
      const priceUpper = tickToPrice(
        baseToken,
        quoteToken,
        position.entity.tickUpper
      );

      return {
        ...position,
        priceLower,
        priceUpper,
        transactions: transactions.filter(
          (tx: FormattedPoolTransaction) =>
            tx.tickLower === position.entity.tickLower &&
            tx.tickUpper === position.entity.tickUpper
        ),
      };
    });
  }, [positions, baseToken, quoteToken, transactions]);

  const toggleShowPositions = () => setShowPositions(!showPositions);

  if (!baseToken || !quoteToken || !chainId || !entity) {
    return (
      <div className="my-4 p-4 border rounded-md">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="my-4 p-4 border rounded-md">
      <div className="flex justify-between">
        <div className="text-2xl text-gray-600 py-2 flex items-center">
          <button className="focus:outline-none" onClick={toggleShowPositions}>
            <Token name={baseToken.name} symbol={baseToken.symbol} />
            <span className="px-1">/</span>
            <Token name={quoteToken.name} symbol={quoteToken.symbol} />
            <span className="rounded-md text-xl text-gray-800 bg-gray-200 p-1">
              {entity.fee / 10000}%
            </span>
          </button>
          {showPositions && (
            <a
              className="px-2"
              href={`https://info.uniswap.org/#/pools/${address}`}
            >
              ↗
            </a>
          )}
        </div>
        <div className="flex flex-col items-center w-48">
          <PositionStatuses
            tickCurrent={entity.tickCurrent}
            positions={positions.map(({ entity }) => entity)}
            onClick={toggleShowPositions}
          />

          <div className="text-lg rounded-md text-gray-800">
            {formatCurrency(getUSDValue(totalValue))}{" "}
          </div>
        </div>
      </div>

      {showPositions && (
        <>
          <table className="table-auto w-3/4 mt-4 mb-12">
            <thead>
              <tr className="text-left">
                <th className="pb-4">Current Price</th>
                <th className="pb-4">Total Liquidity</th>
                <th className="pb-4">Total Uncollected Fees</th>
                <th className="pb-4">Net Return</th>
                <th className="pb-4">APR</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {poolPrice.toFixed(6)}{" "}
                  {quoteToken.equals(WETH9[chainId as ChainId])
                    ? "ETH"
                    : quoteToken.symbol}
                </td>
                <td>{formatCurrency(getUSDValue(liquidity))}</td>
                <td>{formatCurrency(getUSDValue(poolUncollectedFees))}</td>
                <td>
                  <div
                    className={
                      returnValue.lessThan(0)
                        ? "text-red-500"
                        : "text-green-500"
                    }
                  >
                    {formatCurrency(getUSDValue(returnValue))} (
                    {returnPercent.toFixed(2)}%)
                  </div>
                </td>
                <td>
                  <div className={apr < 0 ? "text-red-500" : "text-green-500"}>
                    {apr.toFixed(2)}%
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="table-auto w-full">
            <thead>
              <tr className="text-left">
                <th className="pb-4">Range</th>
                <th className="pb-4">Distribution</th>
                <th className="pb-4">Age</th>
                <th className="pb-4">Liquidity</th>
                <th className="pb-4">Uncl. fees</th>
                <th className="pb-4">Total</th>
                <th className="pb-4">
                  <span
                    style={{ borderBottom: "1px dotted", cursor: "help" }}
                    title="liquidity gain + fees - gas cost"
                  >
                    Net Return
                  </span>
                </th>
                <th className="pb-4">
                  <span
                    style={{ borderBottom: "1px dotted", cursor: "help" }}
                    title="Annual Percentage Return"
                  >
                    APR
                  </span>
                </th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody>
              {positionsWithPricesAndTransactions.map((position) => (
                <Position
                  key={position.id.toString()}
                  pool={entity}
                  quoteToken={quoteToken}
                  {...position}
                />
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Pool;
