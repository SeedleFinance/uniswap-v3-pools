import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { CombinedPoolsProvider, usePools } from '../../CombinedPoolsProvider';
import { PoolState } from '../../hooks/usePoolsState';
import { useCurrencyConversions } from '../../CurrencyConversionsProvider';
import Pool from './Pool';
import FilterClosedToggle from './FilterClosedToggle';
import DownloadCSV from './DownloadCSV';
import Card from '../../ui/Card';
import { Button } from '../../ui/Button';

function Pools() {
  const { convertToGlobal, formatCurrencyWithSymbol } = useCurrencyConversions();

  const { loading, empty, pools } = usePools();

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
      <div className="h-full my-16 flex items-center justify-center">
        <div className="text-center text-2xl text-slate-400 dark:text-slate-100">
          Loading pools...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col-reverse md:flex-row md:justify-between">
        <div className="flex-flex-col text-high">
          <h1 className="text-3 font-bold">Positions</h1>
          <div>A list of your Uniswap V3 positions.</div>
        </div>

        <div className="flex">
          <Card>
            <div className="text-2 my-1 font-bold">
              {formatCurrencyWithSymbol(totalLiquidity, 1)}
            </div>
            <div>Total Liquidity</div>
          </Card>
          <Card className="ml-4">
            <div className="text-2 my-1 font-bold">
              {formatCurrencyWithSymbol(totalUncollectedFees, 1)}
            </div>
            <div>Total Uncollected Fees</div>
          </Card>
          <Card className="ml-4">
            <div className="text-2 my-1 font-bold">
              {formatCurrencyWithSymbol(totalLiquidity + totalUncollectedFees, 1)}
            </div>
            <div>Total Value</div>
          </Card>
        </div>
      </div>
      <div className="w-full mt-8">
        <div className="flex justify-between items-center">
          <Button href="/add/new">Add liquidity</Button>
          <div className="flex">
            <div className="ml-2">
              <FilterClosedToggle />
            </div>
            <div className="ml-2">
              <DownloadCSV />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full">
        {empty ? (
          <div className="py-4 mt-12 rounded-lg">
            <div className="text-center text-1 md:text-1.125 text-low m-8">
              This address do not have any Uniswap LP positions.
            </div>
            <Link
              to="/add/new"
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
                liquidity={poolLiquidity}
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
