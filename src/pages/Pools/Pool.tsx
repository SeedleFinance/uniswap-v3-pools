import React, { useMemo, useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { Token, Price, CurrencyAmount } from '@uniswap/sdk-core';
import { tickToPrice, Pool as UniPool, Position as UniPosition } from '@uniswap/v3-sdk';

import { useTransactions, FormattedPoolTransaction } from '../../hooks/useTransactions';
import { useTransactionTotals, useReturnValue, useAPR, useFeeAPY } from '../../hooks/calculations';
import { useCurrencyConversions } from '../../CurrencyConversionsProvider';
import { WETH9 } from '../../constants';

import Positions from './Positions';
import PositionStatuses from './PositionStatuses';
import PriceChart from './PriceChart';
import LiquidityChart from './LiquidityChart';
import ChevronDown from '../../icons/ChevronDown';
import ChevronUp from '../../icons/ChevronUp';
import PoolButton from '../..//ui/PoolButton';

interface PoolProps {
  address: string;
  entity: UniPool;
  quoteToken: Token;
  baseToken: Token;
  rawPoolLiquidity: BigNumber;
  liquidity: CurrencyAmount<Token>;
  poolUncollectedFees: CurrencyAmount<Token>;
  positions: {
    id: BigNumber;
    entity: UniPosition;
    priceLower?: Price<Token, Token>;
    priceUpper?: Price<Token, Token>;
    positionLiquidity?: CurrencyAmount<Token>;
    uncollectedFees: CurrencyAmount<Token>[];
    positionUncollectedFees: CurrencyAmount<Token>;
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
  const { convertToGlobalFormatted } = useCurrencyConversions();

  const { token0, token1 } = entity;

  const transactions: FormattedPoolTransaction[] = useTransactions(address, token0, token1);

  const [expanded, setExpanded] = useState(false);
  const [showPositions, setShowPositions] = useState(false);
  const [showPriceChart, setShowPriceChart] = useState(false);
  const [showLiquidityChart, setShowLiquidityChart] = useState(false);

  const poolPrice = useMemo(() => {
    if (!quoteToken || !entity) {
      return 0;
    }

    return entity.priceOf(quoteToken);
  }, [quoteToken, entity]);

  const positionsWithPricesAndTransactions = useMemo(() => {
    if (!positions || !positions.length || !baseToken || !quoteToken) {
      return [];
    }

    return positions.map((position) => {
      const priceLower = tickToPrice(quoteToken, baseToken, position.entity.tickLower);
      const priceUpper = tickToPrice(quoteToken, baseToken, position.entity.tickUpper);

      return {
        ...position,
        priceLower,
        priceUpper,
        transactions: transactions.filter(
          (tx: FormattedPoolTransaction) =>
            tx.tickLower === position.entity.tickLower &&
            tx.tickUpper === position.entity.tickUpper,
        ),
      };
    });
  }, [positions, baseToken, quoteToken, transactions]);

  const totalValue = useMemo(() => {
    return liquidity.add(poolUncollectedFees);
  }, [liquidity, poolUncollectedFees]);

  // TODO: refactor how transactions are fetched (to account for closed positions)
  const transactionsInPositions = useMemo(() => {
    return positionsWithPricesAndTransactions.reduce(
      (
        txs: FormattedPoolTransaction[],
        { transactions }: { transactions: FormattedPoolTransaction[] },
      ) => {
        txs.push(...transactions);
        return txs;
      },
      [],
    );
  }, [positionsWithPricesAndTransactions]);

  const { totalMintValue, totalBurnValue, totalCollectValue, totalTransactionCost } =
    useTransactionTotals(transactionsInPositions, baseToken, entity);

  const { returnValue, returnPercent } = useReturnValue(
    baseToken,
    totalMintValue,
    totalBurnValue,
    totalCollectValue,
    totalTransactionCost,
    totalValue,
  );

  const totalFees = totalCollectValue.add(poolUncollectedFees);

  const apr = useAPR(transactionsInPositions, returnPercent, rawPoolLiquidity);

  const feeAPY = useFeeAPY(entity, baseToken, [poolUncollectedFees], transactionsInPositions);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  if (!baseToken || !quoteToken || !entity) {
    return (
      <div className="my-4 p-4 border rounded-md">
        <div className="text-slate-400 dark:text-slate-200">Loading...</div>
      </div>
    );
  }

  return (
    <div className="my-4 p-4 border rounded-md border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 w-full">
      <div onClick={toggleExpand} className="w-full cursor-pointer">
        <div className="flex justify-between">
          <div className="text-2xl text-slate-600 dark:text-slate-300 py-2 flex items-baseline">
            <PoolButton
              baseToken={baseToken}
              quoteToken={quoteToken}
              fee={entity.fee / 10000}
              showNetwork={true}
              onClick={() => {}}
            />
            {expanded && (
              <button onClick={(e) => e.stopPropagation()}>
                <a className="px-2" href={`https://info.uniswap.org/#/pools/${address}`}>
                  ↗
                </a>
              </button>
            )}
          </div>
          <div className="flex flex-col items-center w-48">
            <PositionStatuses
              tickCurrent={entity.tickCurrent}
              positions={positions.map(({ entity }) => entity)}
              onClick={toggleExpand}
            />
            <div className="text-lg rounded-md text-slate-600 dark:text-slate-300">
              {convertToGlobalFormatted(totalValue)}{' '}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <>
          <table className="table-auto w-3/4 mt-4  text-slate-600 dark:text-slate-300">
            <thead>
              <tr className="text-left">
                <th className="pb-4">Current Price</th>
                <th className="pb-4">Total Liquidity</th>
                <th className="pb-4">Total Fees</th>
                <th className="pb-4">
                  <span
                    className="underline underline-offset-1 decoration-dotted cursor-help"
                    title="annualized fees earned over liquidity"
                  >
                    Fee APY
                  </span>
                </th>
                <th className="pb-4">
                  <span
                    className="underline underline-offset-1 decoration-dotted cursor-help"
                    title="liquidity gain + fees - gas cost"
                  >
                    Net Return
                  </span>
                </th>
                <th className="pb-4">
                  <span
                    className="underline underline-offset-1 decoration-dotted cursor-help"
                    title="Net Annual Percentage Yield"
                  >
                    Net APY
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {poolPrice.toFixed(6)}{' '}
                  {baseToken.equals(WETH9[baseToken.chainId]) ? 'ETH' : baseToken.symbol}
                </td>
                <td>{convertToGlobalFormatted(liquidity)}</td>
                <td>
                  {convertToGlobalFormatted(totalFees)} (uncl.{' '}
                  {convertToGlobalFormatted(poolUncollectedFees)})
                </td>
                <td>
                  <div className={feeAPY < 0 ? 'text-red-500' : 'text-green-500'}>
                    {feeAPY.toFixed(2)}%
                  </div>
                </td>

                <td>
                  <div className={returnValue.lessThan(0) ? 'text-red-500' : 'text-green-500'}>
                    {convertToGlobalFormatted(returnValue)} ({returnPercent.toFixed(2)}%)
                  </div>
                </td>
                <td>
                  <div className={apr < 0 ? 'text-red-500' : 'text-green-500'}>
                    {apr.toFixed(2)}%
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex flex-col my-4">
            <div className="flex flex-col items-start mb-4">
              <button
                className="flex items-center focus:outline-none"
                onClick={() => setShowPriceChart(!showPriceChart)}
              >
                <span className="text-lg text-slate-800 dark:text-slate-400 font-bold">Price</span>
                <span className="mx-2">
                  {showPriceChart ? (
                    <ChevronUp className="h-4 w-4 stroke-2 text-slate-800 dark:text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 stroke-2 text-slate-800 dark:text-slate-400" />
                  )}
                </span>
              </button>
              {showPriceChart && (
                <PriceChart address={address} baseToken={baseToken} quoteToken={quoteToken} />
              )}
            </div>

            <div className="flex flex-col items-start mb-4">
              <button
                className="flex items-center focus:outline-none"
                onClick={() => setShowLiquidityChart(!showLiquidityChart)}
              >
                <span className="text-lg text-slate-800 dark:text-slate-400 font-bold">
                  Liquidity
                </span>
                <span className="mx-2">
                  {showLiquidityChart ? (
                    <ChevronUp className="h-4 w-4 stroke-2 text-slate-800 dark:text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 stroke-2 text-slate-800 dark:text-slate-400" />
                  )}
                </span>
              </button>
              {showLiquidityChart && (
                <LiquidityChart
                  address={address}
                  baseToken={baseToken}
                  quoteToken={quoteToken}
                  pool={entity}
                />
              )}
            </div>

            <div className="flex flex-col items-start">
              <button
                className="flex items-center focus:outline-none"
                onClick={() => setShowPositions(!showPositions)}
              >
                <span className="text-lg text-slate-800 dark:text-slate-400 font-bold">
                  Positions
                </span>
                <span className="mx-2">
                  {showPositions ? (
                    <ChevronUp className="h-4 w-4 stroke-2 text-slate-800 dark:text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 stroke-2 text-slate-800 dark:text-slate-400" />
                  )}
                </span>
              </button>

              {showPositions && (
                <Positions
                  positions={positionsWithPricesAndTransactions}
                  pool={entity}
                  baseToken={baseToken}
                  quoteToken={quoteToken}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Pool;
