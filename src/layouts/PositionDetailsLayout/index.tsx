import { CurrencyAmount, Price } from '@uniswap/sdk-core';
import { Position } from '@uniswap/v3-sdk';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';

import Card from '../../components/Card';
import BackArrow from '../../components/icons/LeftArrow';
import PoolButton from '../../components/PoolButton';
import { useFeeAPY } from '../../hooks/calculations';
import { usePools } from '../../providers/CombinedPoolsProvider';

import { useCurrencyConversions } from '../../providers/CurrencyConversionProvider';
import Transaction, { TransactionProps } from '../PoolDetailsLayout/Transaction';

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
  const { id, posId } = query;

  // Select a single pool
  const pool = useMemo(() => {
    if (loadingPools) {
      return null;
    }

    return pools.find((pool) => pool.address === id);
  }, [loadingPools, pools, id]);

  const {
    key,
    address,
    entity,
    quoteToken,
    baseToken,
    positions,
    currentPrice,
    rawPoolLiquidity,
    poolLiquidity,
    currencyPoolUncollectedFees,
    poolUncollectedFees,
  } = pool;

  // using the posId, find the position in the pool
  const position: SeedlePosition = positions.find(
    (position: SeedlePosition) => position.id === Number(posId),
  );

  console.log({ pool, baseToken, poolUncollectedFees, transactions: position.transactions });

  // const feeAPY = useFeeAPY(pool, baseToken, poolUncollectedFees, position.transactions);

  // console.log('feeAPY: ', feeAPY);

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
          <div>
            <span className="ml-20 py-2 px-4 bg-surface-10 text-0.8125">41%</span>
          </div>
          {/* <span className="text-1.25 lg:text-2 font-semibold text-high">{feeAPY}</span> */}
        </div>
        <div className="flex lg:ml-6 w-full lg:w-1/3">
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
        <h1 className="font-bold mt-6">Transactions</h1>

        <table className="table-auto w-full border-separate my-2 px-4 -ml-4">
          <thead className="bg-surface-5">
            <tr className="text-left text-0.875">
              <th className="px-3 py-2">Timestamp</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Distribution</th>
              <th className="px-4 py-2">Liquidity</th>
              <th className="px-4 py-2">Gas cost</th>
            </tr>
          </thead>
          {/* {position.transactions.map((tx) => (
              <Transaction key={tx.id} pool={pool} baseToken={baseToken} {...tx} />
            ))} */}
        </table>
      </div>
    </div>
  );
};

export default PositionDetailsLayout;
