import { CurrencyAmount, Price } from '@uniswap/sdk-core';
import { Position } from '@uniswap/v3-sdk';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
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

/***
 * TODO:
 * - Add price graph showing price range between lower and upper bounds (lakshan to provide API update for this -> hard code for now)
 */

interface SeedleTransaction {
  amount0: CurrencyAmount<any>;
  amount1: CurrencyAmount<any>;
  gas: any;
  id: string;
  timestamp: number;
  transactionHash: string;
  transactionType: string;
}

interface SeedlePosition {
  entity: Position;
  id: number;
  positionLiquidity: CurrencyAmount<any>;
  positionUncollectedFees: CurrencyAmount<any>;
  priceLower: Price<any, any>;
  priceUpper: Price<any, any>;
  transactions: TransactionProps[];
  uncollectableFees: CurrencyAmount<any>;
}

const PositionDetailsLayout = () => {
  const router = useRouter();

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

    return getPositionStatus(pool.tickCurrent, entity);
  }, [pool, entity]);

  const poolLiquidity = pool.poolLiquidity;

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

  return (
    <div className="flex flex-col w-full">
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
              tickLower={entity.tickLower}
              tickUpper={entity.tickUpper}
              tickSpacing={pool.entity.tickSpacing}
              flip={pool.entity.token0.equals(baseToken)}
            />
            <div className="text-0.8125 py-2 flex flex-col">{formattedRange}</div>
          </div>
        </div>
        <div className="flex lg:ml-6 w-full lg:w-1/2">
          <Card className="md:ml-2">
            <div className="text-1.25 md:text-1.75 my-1 font-semibold text-high">{feeAPY}%</div>
            <div className="text-0.875 md:text-1 text-medium text-brand-primary">
              <Tooltip label={LABELS.FEE_APY} placement="bottom">
                <span className="flex items-center cursor-default whitespace-nowrap">
                  Fee APY
                  <IconHelper className="ml-1" />
                </span>
              </Tooltip>
            </div>
          </Card>
          <Card className="md:ml-2">
            <div className="text-1.25 md:text-1.75 my-1 font-semibold text-high">
              {position.positionLiquidity
                ? convertToGlobalFormatted(position.positionLiquidity)
                : formatCurrencyWithSymbol(0, 1)}
            </div>
            <div className="text-0.875 md:text-1 text-medium">Position Liquidity</div>
          </Card>
          <Card className="md:ml-2">
            <div className="text-1.25 md:text-1.75 my-1 font-semibold text-high">
              {convertToGlobalFormatted(position.positionUncollectedFees)}
            </div>
            <div className="text-0.875 md:text-1 text-medium">Uncollected Fees</div>
          </Card>
        </div>
      </div>

      <div>
        <h1 className="font-bold py-4 mt-2">Overview</h1>
        <div className="overflow-x-auto bg-surface-0 shadow-sm mt-4 rounded-lg">
          <table className="table-auto w-full text-high text-0.875">
            <thead className="border-b border-element-10">
              <tr className="text-left align-middle">
                <th className="pb-3 px-6 py-5 whitespace-nowrap font-medium">Distribution</th>
                <th className="pb-3 px-6 py-5 whitespace-nowrap font-medium">Liquidity</th>
                <th className="pb-3 px-6 py-5 whitespace-nowrap font-medium">Uncl. fees</th>
                <th className="pb-3 px-6 py-5 font-medium">
                  <Tooltip label={LABELS.FEE_APY} placement="top">
                    <span className="flex items-center cursor-default whitespace-nowrap">
                      Fee APY
                      <IconHelper className="ml-1" />
                    </span>
                  </Tooltip>
                </th>
                <th className="pb-3 px-4 py-5 font-medium">
                  <Tooltip label={LABELS.NET_RETURN} placement="top-start">
                    <span className="flex items-center cursor-default whitespace-nowrap">
                      Net Return
                      <IconHelper className="ml-1" />
                    </span>
                  </Tooltip>
                </th>
                <th className="pb-3 px-4 py-5 font-medium">
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
                <td className="px-4 py-6 flex flex-col font-medium">
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
                  <div className={feeAPY < 0 ? 'text-red-500' : 'text-green-500'}>{feeAPY}%</div>
                </td>

                <td className="px-4 py-6">
                  <div className={returnValue.lessThan(0) ? 'text-red-500' : 'text-green-500'}>
                    {convertToGlobalFormatted(returnValue)}
                  </div>
                </td>
                <td className="px-4 py-6">
                  <div
                    className={
                      apr < 0 ? 'text-red-500 hidden md:block ' : 'text-green-500 hidden md:block '
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
        <h1 className="font-bold py-4 mt-2">Transactions</h1>
        <div className="overflow-x-auto bg-surface-0 shadow-sm mt-4 rounded-lg mb-4">
          <table className="table-auto w-full border-separate">
            <thead className="bg-surface-5">
              <tr className="text-left text-0.875">
                <th className="px-3 py-2">Receipt</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Distribution</th>
                <th className="px-4 py-2">Liquidity</th>
                <th className="px-4 py-2">Gas cost</th>
              </tr>
            </thead>
            {position.transactions.map((tx) => (
              <Transaction key={tx.id} {...tx} pool={pool.entity} baseToken={baseToken} />
            ))}
          </table>
        </div>
      </div>
    </div>
  );
};

export default PositionDetailsLayout;
