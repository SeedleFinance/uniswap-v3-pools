import React, { useMemo, useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { Token, CurrencyAmount } from '@uniswap/sdk-core';
import { Pool as UniPool } from '@uniswap/v3-sdk';

import { useTransactionTotals, useReturnValue, useAPR, useFeeAPY } from '../../hooks/calculations';
import { useCurrencyConversions } from '../../CurrencyConversionsProvider';
import { WETH9 } from '../../constants';

import Positions from './Positions';
import PositionStatuses from './PositionStatuses';
import PriceChart from './PriceChart';
import LiquidityChart from './LiquidityChart';
import ChevronDown from '../../icons/ChevronDown/ChevronDown';
import ChevronUp from '../../icons/ChevronUp/ChevronUp';
import PoolButton from '../../ui/PoolButton';
import LoadingSpinner from '../../ui/Spinner';

interface PoolProps {
  address: string;
  entity: UniPool;
  quoteToken: Token;
  baseToken: Token;
  rawPoolLiquidity: BigNumber;
  poolLiquidity: CurrencyAmount<Token>;
  poolUncollectedFees: CurrencyAmount<Token>;
  positions: any[];
  // positions: {
  //   id: number;
  //   entity: UniPosition;
  //   priceLower?: Price<Token, Token>;
  //   priceUpper?: Price<Token, Token>;
  //   positionLiquidity?: CurrencyAmount<Token>;
  //   uncollectedFees: CurrencyAmount<Token>[];
  //   positionUncollectedFees: CurrencyAmount<Token>;
  //   transactions: any[];
  // }[];
}

function Pool({
  address,
  entity,
  quoteToken,
  baseToken,
  positions,
  poolLiquidity,
  rawPoolLiquidity,
  poolUncollectedFees,
}: PoolProps) {
  const { convertToGlobalFormatted } = useCurrencyConversions();

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

  const totalValue = useMemo(() => {
    return poolLiquidity.add(poolUncollectedFees);
  }, [poolLiquidity, poolUncollectedFees]);

  const poolTransactions = useMemo(() => {
    return positions.reduce((txs: any[], { transactions }: any) => {
      txs.push(...transactions);
      return txs;
    }, []);
  }, [positions]);

  const { totalMintValue, totalBurnValue, totalCollectValue, totalTransactionCost } =
    useTransactionTotals(poolTransactions, baseToken, entity);

  const { returnValue, returnPercent } = useReturnValue(
    baseToken,
    totalMintValue,
    totalBurnValue,
    totalCollectValue,
    totalTransactionCost,
    totalValue,
  );

  const totalFees = totalCollectValue.add(poolUncollectedFees);

  const apr = useAPR(poolTransactions, returnPercent, rawPoolLiquidity);

  const feeAPY = useFeeAPY(entity, baseToken, [poolUncollectedFees], poolTransactions);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  if (!baseToken || !quoteToken || !entity) {
    return (
      <div className="my-4 p-4 border rounded-md">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="my-4 py-4 px-3 md:px-8 border rounded-md border-element-10 hover:border-element-30 w-full">
      <div onClick={toggleExpand} className="w-full cursor-pointer">
        <div className="flex justify-between">
          <div className="text-2xl text-medium py-2 flex items-start">
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
          <div className="flex flex-col-reverse md:flex-row items-end md:items-center">
            <PositionStatuses
              tickCurrent={entity.tickCurrent}
              positions={positions.map(({ entity }) => entity)}
              onClick={toggleExpand}
            />
            <div className="text-lg rounded-md text-high ml-2 font-medium">
              {convertToGlobalFormatted(totalValue)}
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <>
          <div className="overflow-x-auto">
            <table className="table-auto w-full mt-4 text-high text-0.875 border border-element-10">
              <thead className="bg-surface-10">
                <tr className="text-left align-middle">
                  <th className="pb-3 px-4 py-3">Current Price</th>
                  <th className="pb-3 px-4 py-3">Total Liquidity</th>
                  <th className="pb-3 px-4 py-3">Total Fees</th>
                  <th className="pb-3 px-4 py-3">
                    <span
                      className="underline underline-offset-1 decoration-dotted cursor-help"
                      title="annualized fees earned over liquidity"
                    >
                      Fee APY
                    </span>
                  </th>
                  <th className="pb-3 px-4 py-3">
                    <span
                      className="underline underline-offset-1 decoration-dotted cursor-help"
                      title="liquidity gain + fees - gas cost"
                    >
                      Net Return
                    </span>
                  </th>
                  <th className="pb-3 px-4 py-3">
                    <span
                      className="underline underline-offset-1 decoration-dotted cursor-help"
                      title="Net Annual Percentage Yield"
                    >
                      Net APY
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-0.8175 align-top">
                <tr>
                  <td className="px-4 py-4">
                    {poolPrice.toFixed(6)}{' '}
                    <span className="font-medium">
                      {baseToken.equals(WETH9[baseToken.chainId]) ? 'ETH' : baseToken.symbol}
                    </span>
                  </td>
                  <td className="px-4 py-4">{convertToGlobalFormatted(poolLiquidity)}</td>
                  <td className="px-4 py-4">
                    {convertToGlobalFormatted(totalFees)} (uncl.{' '}
                    {convertToGlobalFormatted(poolUncollectedFees)})
                  </td>
                  <td className="px-4 py-4">
                    <div className={feeAPY < 0 ? 'text-red-500' : 'text-green-500'}>
                      {feeAPY.toFixed(2)}%
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className={returnValue.lessThan(0) ? 'text-red-500' : 'text-green-500'}>
                      {convertToGlobalFormatted(returnValue)} ({returnPercent.toFixed(2)}%)
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={apr < 0 ? 'text-red-500' : 'text-green-500'}>
                      {apr.toFixed(2)}%
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col my-4">
            <div className="flex flex-col items-start mb-4">
              <button
                className="flex items-center focus:outline-none text-high"
                onClick={() => setShowPriceChart(!showPriceChart)}
              >
                <span className="text-1 font-bold">Price</span>
                <span className="mx-2">
                  {showPriceChart ? (
                    <ChevronUp className="h-4 w-4 stroke-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 stroke-2" />
                  )}
                </span>
              </button>
              {showPriceChart && (
                <PriceChart address={address} baseToken={baseToken} quoteToken={quoteToken} />
              )}
            </div>

            <div className="flex flex-col items-start mb-4">
              <button
                className="flex items-center focus:outline-none text-high"
                onClick={() => setShowLiquidityChart(!showLiquidityChart)}
              >
                <span className="text-1 font-bold">Liquidity</span>
                <span className="mx-2">
                  {showLiquidityChart ? (
                    <ChevronUp className="h-4 w-4 stroke-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 stroke-2" />
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
                className="flex items-center focus:outline-none text-high"
                onClick={() => setShowPositions(!showPositions)}
              >
                <span className="text-1 font-bold">Positions</span>
                <span className="mx-2">
                  {showPositions ? (
                    <ChevronUp className="h-4 w-4 stroke-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 stroke-2" />
                  )}
                </span>
              </button>

              {showPositions && (
                <Positions
                  positions={positions}
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
