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

import { useUSDConversion } from "./hooks/useUSDConversion";
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
  quoteToken: UniToken | null;
  baseToken: UniToken | null;
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
  poolUncollectedFees,
}: PoolProps) {
  const { chainId } = useWeb3React();

  const getUSDValue = useUSDConversion(quoteToken);
  const { token0, token1 } = entity;

  const transactions = useTransactions(address, token0, token1);

  const [showPositions, setShowPositions] = useState(false);

  const poolPrice = useMemo(() => {
    if (!baseToken || !entity) {
      return 0;
    }

    return entity.priceOf(baseToken);
  }, [baseToken, entity]);

  const totalValue = useMemo(() => {
    return getUSDValue(liquidity.add(poolUncollectedFees));
  }, [liquidity, poolUncollectedFees, getUSDValue]);

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
            {formatCurrency(totalValue)}{" "}
          </div>
        </div>
      </div>

      {showPositions && (
        <>
          <table className="table-auto w-1/2 mt-4 mb-8">
            <thead>
              <tr className="text-left">
                <th className="pb-4">Current Price</th>
                <th className="pb-4">Total Liquidity</th>
                <th className="pb-4">Total Uncollected Fees</th>
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
