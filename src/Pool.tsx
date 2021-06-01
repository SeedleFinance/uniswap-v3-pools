import React, { useMemo, useState } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { useWeb3React } from "@web3-react/core";
import { ChainId, WETH9, Token as UniToken } from "@uniswap/sdk-core";
import { tickToPrice } from "@uniswap/v3-sdk";

import { DAI, USDC, USDT, FEI, LUSD } from "./constants";

import { useToken } from "./hooks/useToken";
import { usePool } from "./hooks/usePool";
import {
  useTransactions,
  FormattedPoolTransaction,
} from "./hooks/useTransactions";

import Token from "./Token";
import Position from "./Position";
import PositionStatuses from "./PositionStatuses";

interface PoolProps {
  token0address: string | undefined;
  token1address: string | undefined;
  fee: number;
  positions: {
    id: BigNumber;
    tickLower: number;
    tickUpper: number;
    liquidity: BigNumber;
  }[];
}

function getQuoteToken(
  chainId: ChainId | undefined,
  token0: UniToken | null,
  token1: UniToken | null
): UniToken | null {
  if (!chainId || !token0 || !token1) {
    return null;
  }

  const quoteCurrencies: UniToken[] = [
    USDC,
    USDT,
    DAI,
    FEI,
    LUSD,
    WETH9[chainId],
  ];
  const quote = quoteCurrencies.find(
    (cur) => token0.equals(cur) || token1.equals(cur)
  );
  // if no matching quote currency found, use token0
  return quote || token0;
}

function Pool({ token0address, token1address, fee, positions }: PoolProps) {
  const { chainId } = useWeb3React();

  const token0 = useToken(token0address);
  const token1 = useToken(token1address);

  const { pool, poolAddress } = usePool(token0, token1, fee);
  const transactions = useTransactions(poolAddress, token0, token1);

  const [showPositions, setShowPositions] = useState(false);

  const { baseToken, quoteToken } = useMemo(() => {
    if (!chainId || !token0 || !token1) {
      return { baseToken: null, quoteToken: null };
    }

    const quoteToken = getQuoteToken(chainId, token0, token1);
    const baseToken = quoteToken && token0.equals(quoteToken) ? token1 : token0;
    return { baseToken, quoteToken };
  }, [chainId, token0, token1]);

  const poolPrice = useMemo(() => {
    if (!baseToken || !pool) {
      return 0;
    }

    return pool.priceOf(baseToken);
  }, [baseToken, pool]);

  const positionsWithPricesAndTransactions = useMemo(() => {
    if (!positions.length || !baseToken || !quoteToken) {
      return [];
    }

    return positions.map((position) => {
      const priceLower = tickToPrice(baseToken, quoteToken, position.tickLower);
      const priceUpper = tickToPrice(baseToken, quoteToken, position.tickUpper);

      return {
        ...position,
        priceLower,
        priceUpper,
        transactions: transactions.filter(
          (tx: FormattedPoolTransaction) =>
            tx.tickLower === position.tickLower &&
            tx.tickUpper === position.tickUpper
        ),
      };
    });
  }, [positions, baseToken, quoteToken, transactions]);

  const toggleShowPositions = () => setShowPositions(!showPositions);

  if (!baseToken || !quoteToken || !chainId || !pool) {
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
          <button onClick={toggleShowPositions}>
            <Token name={baseToken.name} symbol={baseToken.symbol} />
            <span className="px-1">/</span>
            <Token name={quoteToken.name} symbol={quoteToken.symbol} />
            <span className="rounded-md text-xl text-gray-800 bg-gray-200 p-1">
              {fee / 10000}%
            </span>
          </button>
          {showPositions && (
            <a
              className="px-2"
              href={`https://info.uniswap.org/#/pools/${poolAddress}`}
            >
              ↗
            </a>
          )}
        </div>
        <div className="flex flex-col items-center w-48">
          <PositionStatuses
            tickCurrent={pool.tickCurrent}
            positions={positions}
            onClick={toggleShowPositions}
          />
          <div className="text-lg rounded-md text-gray-800">
            {poolPrice.toFixed(6)}{" "}
            {quoteToken.equals(WETH9[chainId as ChainId])
              ? "ETH"
              : quoteToken.symbol}
          </div>
        </div>
      </div>

      {showPositions && (
        <>
          <table className="table-auto border-separate w-full">
            <thead>
              <tr className="text-left">
                <th>Range</th>
                <th>Distribution</th>
                <th>Liquidity</th>
                <th>Unclaimed fees</th>
                <th>Total</th>
                <th>
                  <span
                    style={{ borderBottom: "1px dotted", cursor: "help" }}
                    title="liquidity gain + fees - gas cost"
                  >
                    Return
                  </span>
                </th>
                <th>
                  <span
                    style={{ borderBottom: "1px dotted", cursor: "help" }}
                    title="Annual Percentage Return"
                  >
                    APY
                  </span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {positionsWithPricesAndTransactions.map((position) => (
                <Position
                  key={position.id.toString()}
                  pool={pool}
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
