import React, { useMemo, useState } from "react";
import { min, max } from "lodash";
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

import {
  useTransactions,
  FormattedPoolTransaction,
} from "./hooks/useTransactions";
import {
  useTransactionTotals,
  useReturnValue,
  useAPR,
} from "./hooks/calculations";
import { usePoolDayData } from "./hooks/usePoolDayData";
import { usePools } from "./PoolsProvider";

import Token from "./Token";
import Positions from "./Positions";
import PositionStatuses from "./PositionStatuses";

interface PoolProps {
  address: string;
  entity: UniPool;
  quoteToken: UniToken;
  baseToken: UniToken;
  rawPoolLiquidity: BigNumber;
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
  rawPoolLiquidity,
  poolUncollectedFees,
}: PoolProps) {
  const { chainId } = useWeb3React();
  const { convertToGlobalFormatted } = usePools();

  const { token0, token1 } = entity;

  const transactions: FormattedPoolTransaction[] = useTransactions(
    address,
    token0,
    token1
  );

  const poolDayData = usePoolDayData(address);
  const [minTickLast30, maxTickLast30] = useMemo(() => {
    if (!poolDayData || !poolDayData.length) {
      return [0, 0];
    }
    const ticksLast30 = poolDayData.map((data: { tick: number }) => data.tick);
    if (!ticksLast30.length) {
      return [0, 0];
    }
    return [min(ticksLast30), max(ticksLast30)];
  }, [poolDayData]);

  const [expanded, setExpanded] = useState(false);
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
  } = useTransactionTotals(transactions, quoteToken, entity);

  const { returnValue, returnPercent } = useReturnValue(
    quoteToken,
    totalMintValue,
    totalBurnValue,
    totalCollectValue,
    totalTransactionCost,
    totalValue
  );

  const totalFees = totalCollectValue.add(poolUncollectedFees);

  const apr = useAPR(transactions, returnPercent, rawPoolLiquidity);

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
  const toggleExpand = () => setExpanded(!expanded);

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
          <button
            className="focus:outline-none flex items-center p-1"
            onClick={toggleExpand}
          >
            <Token name={baseToken.name} symbol={baseToken.symbol} />
            <span className="px-1">/</span>
            <Token name={quoteToken.name} symbol={quoteToken.symbol} />
            <span className="rounded-md text-xl text-gray-800 bg-gray-200 ml-1 px-1">
              {entity.fee / 10000}%
            </span>
          </button>
          {expanded && (
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
            onClick={toggleExpand}
          />
          <div className="text-lg rounded-md text-gray-800">
            {convertToGlobalFormatted(totalValue)}{" "}
          </div>
        </div>
      </div>

      {expanded && (
        <>
          <table className="table-auto w-3/4 mt-4 mb-12">
            <thead>
              <tr className="text-left">
                <th className="pb-4">Current Price</th>
                <th className="pb-4">Total Liquidity</th>
                <th className="pb-4">Total Fees</th>
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
                <td>{convertToGlobalFormatted(liquidity)}</td>
                <td>
                  {convertToGlobalFormatted(totalFees)} (uncl.{" "}
                  {convertToGlobalFormatted(poolUncollectedFees)})
                </td>
                <td>
                  <div
                    className={
                      returnValue.lessThan(0)
                        ? "text-red-500"
                        : "text-green-500"
                    }
                  >
                    {convertToGlobalFormatted(returnValue)} (
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

          <div>
            <button onClick={toggleShowPositions}>Positions</button>
          </div>

          {showPositions && (
            <Positions
              positions={positionsWithPricesAndTransactions}
              pool={entity}
              quoteToken={quoteToken}
            />
          )}
        </>
      )}
    </div>
  );
}

export default Pool;
