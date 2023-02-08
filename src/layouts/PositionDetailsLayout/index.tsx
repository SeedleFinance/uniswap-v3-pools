import React, { useMemo, useState } from 'react';
import { CurrencyAmount, Price } from '@uniswap/sdk-core';
import { Position } from '@uniswap/v3-sdk';
import { useRouter } from 'next/router';
import { LABELS } from '../../common/constants';

import Card from '../../components/Card';
import BackArrow from '../../components/icons/LeftArrow';
import PoolButton from '../../components/PoolButton';
import Tooltip from '../../components/Tooltip';
import IconHelper from '../../components/icons/Helper';
import { useAPR, useFeeAPY, useReturnValue, useTransactionTotals } from '../../hooks/calculations';
import { usePools } from '../../providers/CombinedPoolsProvider';

import { useCurrencyConversions } from '../../providers/CurrencyConversionProvider';
import Transaction, { TransactionProps } from '../PoolDetailsLayout/Transaction';
import RangeVisual from '../PoolDetailsLayout/RangeVisual';
import { getPositionStatus, PositionStatus } from '../../utils/positionStatus';
import Warning from '../../components/icons/Warning';
import TokenLabel from '../../components/TokenLabel';
import { CustomPosition } from '../../types/seedle';
import { BigNumber } from 'ethers';
import Button from '../../components/Button';
import Plus from '../../components/icons/Plus';
import DropdownMenu from '../../components/DropdownMenu';
import IconOptions from '../../components/icons/Options';
import IconTransfer from '../../components/icons/Transfer';
import IconTrash from '../../components/icons/Trash';
import ChartPeriodSelector from '../../components/ChartPeriodSelector';
import PriceChart from '../PoolDetailsLayout/Chart/PriceChart';
import LiquidityChart from '../PoolDetailsLayout/Chart/LiquidityChart';

interface SeedleTransaction {
  amount0: CurrencyAmount<any>;
  amount1: CurrencyAmount<any>;
  gas: any;
  id: string;
  timestamp: number;
  transactionHash: string;
  transactionType: string;
}

type GraphType = 'price' | 'liquidity';

interface SeedlePosition {
  entity: Position;
  id: number;
  positionLiquidity: CurrencyAmount<any>;
  positionUncollectedFees: CurrencyAmount<any>;
  priceLower: Price<any, any>;
  priceUpper: Price<any, any>;
  tickLower: number;
  tickUpper: number;
  transactions: TransactionProps[];
  uncollectableFees: CurrencyAmount<any>;
}

function handleTransferPosition(id: number) {
  const url = `https://app.uniswap.org/#/pool/${id}`;
  window.open(url);
}

function handleRemovePosition(id: number) {
  const url = `https://app.uniswap.org/#/pool/${id}`;
  window.open(url);
}

const PositionDetailsLayout = () => {
  const router = useRouter();
  const [period, setPeriod] = useState<number>(30);
  const [chart, setChart] = useState<GraphType>('price');

  const { loading: loadingPools, pools, lastLoaded, refresh, refreshingList } = usePools();
  const { convertToGlobalFormatted, formatCurrencyWithSymbol } = useCurrencyConversions();
  const { query } = useRouter();
  const { id, poolid } = query;

  // Select a single pool
  const pool = useMemo(() => {
    if (loadingPools) {
      return null;
    }

    return pools.find((pool) => pool.address === id);
  }, [loadingPools, pools, id]);

  const { entity, quoteToken, baseToken, positions } = pool;

  const positionStatus = useMemo((): PositionStatus => {
    if (!pool) {
      return PositionStatus.Inactive;
    }

    const position = positions.find((position: SeedlePosition) => position.id === Number(poolid));

    return getPositionStatus(entity.tickCurrent, position.entity);
  }, [pool, entity, poolid, positions]);

  const statusLabel = useMemo(() => {
    const labels = {
      [PositionStatus.Inactive]: 'Closed',
      [PositionStatus.InRange]: 'In Range',
      [PositionStatus.OutRange]: 'Out of Range',
    };
    return labels[positionStatus];
  }, [positionStatus]);

  const getStatusColor = (status: PositionStatus) => {
    const colors = {
      [PositionStatus.Inactive]: 'text-medium',
      [PositionStatus.InRange]: 'text-green-500',
      [PositionStatus.OutRange]: 'text-yellow-500',
    };
    return colors[positionStatus];
  };

  // using the poolId, find the position in the pool
  const position: SeedlePosition = positions.find(
    (position: SeedlePosition) => position.id === Number(poolid),
  );

  const formattedRange = useMemo(() => {
    const prices = position.priceLower.lessThan(position.priceUpper)
      ? [position.priceLower, position.priceUpper]
      : [position.priceUpper, position.priceLower];
    const decimals = Math.min(baseToken.decimals, 8);
    return prices.map((price) => price.toFixed(decimals)).join(' - ');
  }, [baseToken]);

  // Note - we push it into an array here as it expects an array
  const uncollectedFees = [position.positionUncollectedFees];
  const feeAPY = useFeeAPY(pool.entity, baseToken, uncollectedFees, position.transactions);

  const totalCurrentValue = useMemo(() => {
    if (!position.positionLiquidity || position.positionLiquidity.equalTo(0)) {
      return CurrencyAmount.fromRawAmount(baseToken, 0);
    }

    return position.positionLiquidity.add(position.positionUncollectedFees);
  }, [baseToken, position.positionLiquidity, position.positionUncollectedFees]);

  const poolTransactions = useMemo(() => {
    return positions.reduce((txs: any[], { transactions }: any) => {
      txs.push(...transactions);
      return txs;
    }, []);
  }, [positions]);

  // total distribution – from all positions
  const distribution = useMemo(() => {
    let amount0 = CurrencyAmount.fromRawAmount(entity.token0, '0');
    let amount1 = CurrencyAmount.fromRawAmount(entity.token1, '0');

    positions.forEach((position: CustomPosition) => {
      amount0 = amount0.add(position.entity.amount0);
      amount1 = amount1.add(position.entity.amount1);
    });

    return [amount0, amount1];
  }, [entity, positions]);

  const { totalMintValue, totalBurnValue, totalCollectValue, totalTransactionCost } =
    useTransactionTotals(position.transactions, baseToken, entity);

  const handleChangePeriod = (days: number) => {
    setPeriod(days);
  };

  const { returnValue, returnPercent } = useReturnValue(
    baseToken,
    totalMintValue,
    totalBurnValue,
    totalCollectValue,
    totalTransactionCost,
    totalCurrentValue,
  );

  const apr = useAPR(
    position.transactions,
    returnPercent,
    BigNumber.from(entity.liquidity.toString()),
  );

  function handleClickChangeGraph(type: GraphType) {
    setChart(type);
  }

  if (!pool?.positions) {
    return (
      <div>
        <div className="flex items-center">
          <div className="flex flex-col">
            <div className="bg-surface-10 rounded w-32 h-4"></div>
            <div className="bg-surface-10 rounded-sm w-96 h-12 mt-4"></div>
          </div>
        </div>
        <div className="bg-surface-10 rounded w-full h-20 mt-8"></div>
        <div className="bg-surface-10 rounded w-full h-20 mt-4"></div>
      </div>
    );
  }

  // TODO: probably not neededed / duplicate entity's
  const positionEntity: SeedlePosition = positions.find(
    (position: SeedlePosition) => position.id === Number(poolid),
  ).entity;

  return (
    <div className="flex flex-col w-full h-full">
      <button onClick={() => router.back()}>
        <a className="text-0.875 font-medium text-medium flex items-center">
          <BackArrow />
          <span className="ml-2">Back</span>
        </a>
      </button>
      <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center mt-4">
        <div className="flex flex-col mt-8 md:mt-0">
          <PoolButton
            baseToken={baseToken}
            quoteToken={quoteToken}
            fee={entity.fee / 10000}
            showNetwork={true}
            onClick={() => {}}
            size="lg"
          />
          <div className="ml-20">
            <div
              className={`text-0.8125 py-1 font-medium flex items-center pointer ${getStatusColor(
                positionStatus,
              )}`}
            >
              {statusLabel}
              {positionStatus === 2 && (
                <Tooltip label={LABELS.POSITION.OUT_OF_RANGE} placement="top">
                  <div className="pointer">
                    <Warning className="ml-2 bg-yellow-500" />
                  </div>
                </Tooltip>
              )}
            </div>
            <RangeVisual
              tickCurrent={pool.entity.tickCurrent}
              tickLower={positionEntity.tickLower}
              tickUpper={positionEntity.tickUpper}
              tickSpacing={pool.entity.tickSpacing}
              flip={pool.entity.token0.equals(baseToken)}
            />
            <div className="text-0.8125 py-2 flex flex-col">{formattedRange}</div>
          </div>
        </div>
        <div className="flex lg:ml-6 w-full lg:w-1/2">
          <Card className="md:ml-2 justify-between">
            <div className="text-1.25 md:text-1.75 font-semibold text-high">
              {position.positionLiquidity
                ? convertToGlobalFormatted(position.positionLiquidity)
                : formatCurrencyWithSymbol(0, 1)}
            </div>
            <div className="text-0.875 md:text-1 text-medium">Position Liquidity</div>
          </Card>
          <Card className="md:ml-2 justify-between">
            <div className="text-1.25 md:text-1.75 font-semibold text-high">
              {convertToGlobalFormatted(position.positionUncollectedFees)}
            </div>
            <div className="text-0.875 md:text-1 text-medium">Uncollected Fees</div>
          </Card>
          <Card className="md:ml-2">
            <div className="text-1.25 md:text-1.75 font-semibold text-high flex flex-col leading-tight">
              <div>{convertToGlobalFormatted(returnValue)}</div>
              <span
                className={
                  apr > 0
                    ? 'text-green-500 text-0.875 text-medium font-normal'
                    : 'text-red-600 text-0.875 text-medium font-normal'
                }
              >
                ({apr.toFixed(2)}%)
              </span>
            </div>
            <div className="text-0.875 md:text-1 text-medium">
              <Tooltip label={LABELS.NET_OVERVIEW} placement="bottom">
                <span className="flex items-center cursor-default whitespace-nowrap">
                  Net Overview
                  <IconHelper className="ml-1" />
                </span>
              </Tooltip>
            </div>
          </Card>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mt-8">
          <h1 className="font-semibold py-2 mt-4 text-1.125">Overview</h1>
          <div className="flex gap-1">
            <Button
              href={`/add?quoteToken=${quoteToken.symbol}&baseToken=${baseToken.symbol}&fee=3000`}
              disabled={false}
              tabIndex={8}
              className="mr-2"
            >
              <div className="flex items-center -ml-1">
                <Plus />
                <span className="ml-1">Add Liquidity</span>
              </div>
            </Button>
            <DropdownMenu
              options={[
                {
                  label: 'Transfer',
                  cb: () => handleTransferPosition(position.id),
                  icon: <IconTransfer />,
                },
                {
                  label: 'Remove',
                  cb: () => handleTransferPosition(position.id),
                  icon: <IconTrash />,
                },
              ]}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <IconOptions />
              </div>
            </DropdownMenu>
          </div>
        </div>

        <div className="bg-surface-0 shadow-md h-80 my-6 p-4 rounded-lg w-full">
          <div className="flex justify-between items-center">
            <div className="flex border border-element-10 bg-surface-0 text-0.75 px-4 py-1 w-fit text-medium">
              <button
                onClick={() => handleClickChangeGraph('price')}
                className={`ml-2 px-2 uppercase font-medium ${
                  chart === 'price' ? 'text-purple-700 dark:text-purple-400' : 'text-low'
                }`}
              >
                Price
              </button>
              <button
                onClick={() => handleClickChangeGraph('liquidity')}
                className={`ml-2 px-2 uppercase font-medium ${
                  chart === 'liquidity' ? 'text-purple-700 dark:text-purple-400' : 'text-low'
                }`}
              >
                Liquidity
              </button>
            </div>
            <ChartPeriodSelector current={period} onSelect={handleChangePeriod} />
          </div>

          {chart === 'price' && (
            <PriceChart
              address={id as string}
              baseToken={baseToken}
              quoteToken={quoteToken}
              period={period}
            />
          )}
          {chart === 'liquidity' && (
            <LiquidityChart
              address={id as string}
              baseToken={baseToken}
              quoteToken={quoteToken}
              pool={pool.entity}
            />
          )}
        </div>

        <div className="overflow-x-auto bg-surface-0 shadow-sm mt-4 rounded-lg">
          <table className="table-auto w-full text-high text-0.875">
            <thead className="border-b border-element-10">
              <tr className="text-left align-middle">
                <th className="px-6 py-3 whitespace-nowrap font-semibold">Distribution</th>
                <th className="px-6 py-3 whitespace-nowrap font-semibold">Liquidity</th>
                <th className="px-6 py-3 whitespace-nowrap font-semibold">Uncl. fees</th>
                <th className="px-6 py-3 font-semibold">
                  <Tooltip label={LABELS.FEE_APY} placement="top">
                    <span className="flex items-center cursor-default whitespace-nowrap">
                      Fee APY
                      <IconHelper className="ml-1" />
                    </span>
                  </Tooltip>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <Tooltip label={LABELS.NET_RETURN} placement="top-start">
                    <span className="flex items-center cursor-default whitespace-nowrap">
                      Net Return
                      <IconHelper className="ml-1" />
                    </span>
                  </Tooltip>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <Tooltip label={LABELS.NET_APY} placement="top">
                    <span className="flex items-center cursor-default whitespace-nowrap">
                      Net APY
                      <IconHelper className="ml-1" />
                    </span>
                  </Tooltip>
                </th>
              </tr>
            </thead>
            <tbody className="text-0.875 align-wtop">
              <tr>
                <td className="px-4 py-6 flex flex-col font-regular">
                  {distribution.map((token: any) => (
                    <div className="flex px-2" key={token.currency.symbol}>
                      <TokenLabel symbol={token.currency.symbol} size="sm" />
                      {token.toSignificant(6)}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-6">
                  {position.positionLiquidity
                    ? convertToGlobalFormatted(position.positionLiquidity)
                    : formatCurrencyWithSymbol(0, 1)}
                </td>

                <td className="px-4 py-6">
                  {convertToGlobalFormatted(position.positionUncollectedFees)}
                </td>

                <td className="px-4 py-6">
                  <div className={feeAPY < 0 ? 'text-red-600' : 'text-green-500'}>{feeAPY}%</div>
                </td>

                <td className="px-4 py-6">
                  <div className={returnValue.lessThan(0) ? 'text-red-600' : 'text-green-500'}>
                    {convertToGlobalFormatted(returnValue)}
                  </div>
                </td>
                <td className="px-4 py-6">
                  <div
                    className={
                      apr < 0 ? 'text-red-600 hidden md:block ' : 'text-green-500 hidden md:block '
                    }
                  >
                    {apr.toFixed(2)}%
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h1 className="font-semibold py-2 mt-8 text-1.125">Transactions</h1>
        <div className="overflow-x-auto bg-surface-0 shadow-sm mt-4 rounded-lg mb-4">
          <table className="table-auto w-full">
            <thead className="border-b">
              <tr className="text-left text-0.875">
                <th className="px-6 py-3 font-semibold">Receipt</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Distribution</th>
                <th className="px-6 py-3 font-semibold">Liquidity</th>
                <th className="px-6 py-3 font-semibold">Gas cost</th>
              </tr>
            </thead>
            {position.transactions.map((tx) => (
              <tbody key={tx.id}>
                <Transaction {...tx} pool={pool.entity} baseToken={baseToken} />
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </div>
  );
};

export default PositionDetailsLayout;
