import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { CombinedPoolsProvider, usePools } from '../../CombinedPoolsProvider';
import { PoolState } from '../../hooks/usePoolsState';
import { useCurrencyConversions } from '../../CurrencyConversionsProvider';
import Pool from './Pool';
import FilterClosedToggle from './FilterClosedToggle';
import LastUpdatedStamp from './LastUpdatedStamp';
import DownloadCSV from './DownloadCSV';
import Card from '../../ui/Card';
import { Button } from '../../ui/Button';
import Plus from '../../icons/Plus';
import { ROUTES } from '../../constants';

function Pools() {
  const { convertToGlobal, formatCurrencyWithSymbol } = useCurrencyConversions();

  const { loading, empty, pools, lastLoaded, refresh, refreshingList } = usePools();

  // sort pools by liquidity
  const sortedPools = useMemo(() => {
    if (loading) {
      return [];
    }

    return pools.sort((a, b) => {
      const aLiq = convertToGlobal(a.poolLiquidity);
      const bLiq = convertToGlobal(b.poolLiquidity);
      return bLiq - aLiq;
    });
  }, [loading, pools, convertToGlobal]);

  // calculate total
  const [totalLiquidity, totalUncollectedFees] = useMemo(() => {
    if (loading) {
      return [0, 0];
    }

    return pools.reduce(
      (accm, pool) => {
        let totalLiquidity = 0;
        let totalUncollectedFees = 0;

        const { poolLiquidity, poolUncollectedFees } = pool;

        const poolLiquidityInGlobal = convertToGlobal(poolLiquidity);
        const uncollectedFeesInGlobal = convertToGlobal(poolUncollectedFees);

        totalLiquidity = accm[0] + poolLiquidityInGlobal;
        totalUncollectedFees = accm[1] + uncollectedFeesInGlobal;

        return [totalLiquidity, totalUncollectedFees];
      },
      [0, 0],
    );
  }, [loading, pools, convertToGlobal]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="bg-surface-10 rounded w-64 h-12"></div>
            <div className="bg-surface-10 rounded-sm w-64 h-4 mt-4"></div>
          </div>
          <div className="bg-surface-10 rounded w-96 h-20 ml-4"></div>
        </div>
        <div className="bg-surface-10 rounded w-full h-20 mt-8"></div>
        <div className="bg-surface-10 rounded w-full h-20 mt-4"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col-reverse md:flex-row md:justify-between items-center">
        <div className="hidden md:flex w-1/2 flex-col text-high">
          <h1 className="text-2.75 font-bold tracking-tighter leading-tight">Positions</h1>
          <div className="text-medium">A list of your Uniswap V3 positions.</div>
        </div>

        <div className="flex w-full">
          <Card>
            <div className="text-1.25 md:text-1.75 my-1 font-semibold text-high">
              {formatCurrencyWithSymbol(totalLiquidity, 1)}
            </div>
            <div className="text-0.875 md:text-1 text-medium">Total Liquidity</div>
          </Card>
          <Card className="ml-1 md:ml-4">
            <div className="text-1.25 md:text-1.75 my-1 font-semibold text-high">
              {formatCurrencyWithSymbol(totalUncollectedFees, 1)}
            </div>
            <div className="text-0.875 md:text-1 text-medium">
              <span className="hidden md:inline-block">Total</span> Uncollected Fees
            </div>
          </Card>
          <Card className="ml-1 md:ml-4">
            <div className="text-1.25 md:text-1.75 my-1 font-semibold text-brand-dark-primary">
              {formatCurrencyWithSymbol(totalLiquidity + totalUncollectedFees, 1)}
            </div>
            <div className="text-0.875 md:text-1 text-medium">Total Value</div>
          </Card>
        </div>
      </div>
      <div className="w-full mt-4 md:mt-8">
        <div className="flex justify-between items-center">
          <Button href="/add/new" size="md">
            <div className="flex items-center">
              <Plus />
              <span className="ml-1">New Position</span>
            </div>
          </Button>
          <div className="flex flex-col-reverse items-end md:flex-row md:items-center">
            <div className="items-center ml-2 flex">
              <LastUpdatedStamp
                loading={loading || refreshingList}
                lastLoaded={lastLoaded}
                refresh={refresh}
              />
            </div>
            <FilterClosedToggle />
            <div className="ml-2 hidden md:flex">
              <DownloadCSV />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mt-4">
        {empty ? (
          <div className="py-4 mt-12 rounded-lg">
            <div className="text-center text-1 md:text-1.125 text-low m-8">
              This address do not have any Uniswap LP positions.
            </div>
            <Link
              to={ROUTES.ADD_NEW}
              className="block text-center text-1.125 text-blue-primary font-medium m-8"
            >
              + Add Liquidity
            </Link>
          </div>
        ) : (
          sortedPools.map(
            ({
              key,
              address,
              entity,
              quoteToken,
              baseToken,
              rawPoolLiquidity,
              poolLiquidity,
              poolUncollectedFees,
              positions,
            }: PoolState) => (
              <Pool
                key={key}
                address={address}
                entity={entity}
                quoteToken={quoteToken}
                baseToken={baseToken}
                positions={positions}
                rawPoolLiquidity={rawPoolLiquidity}
                poolLiquidity={poolLiquidity}
                poolUncollectedFees={poolUncollectedFees}
              />
            ),
          )
        )}
      </div>
    </div>
  );
}

function PoolsWrapped() {
  return (
    <CombinedPoolsProvider>
      <Pools />
    </CombinedPoolsProvider>
  );
}

export default PoolsWrapped;
