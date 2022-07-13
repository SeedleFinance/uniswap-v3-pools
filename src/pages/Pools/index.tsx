import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { CombinedPoolsProvider, usePools } from '../../CombinedPoolsProvider';
import { PoolState } from '../../hooks/usePoolsState';
import { useCurrencyConversions } from '../../CurrencyConversionsProvider';

import Button from '../../ui/Button';
import Card from '../../ui/Card';
import DownloadCSV from '../../ui/DownloadCSV';
import FilterClosedToggle from './FilterClosedToggle';
import LastUpdatedStamp from '../../ui/LastUpdatedStamp';
import Plus from '../../icons/Plus';
import PoolButton from '../../ui/PoolButton';
import PositionStatuses from './PositionStatuses';

import { ROUTES } from '../../constants';

function Pools() {
  const { convertToGlobal, formatCurrencyWithSymbol, convertToGlobalFormatted } =
    useCurrencyConversions();

  const { loading, empty, pools, lastLoaded, refresh, refreshingList } = usePools();

  console.log('pools', pools);

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
    <div className="w-full h-full">
      <div className="flex flex-col-reverse md:flex-row md:justify-between items-center">
        <div className="hidden md:flex w-1/2 flex-col text-high">
          <h1 className="text-2.5 font-bold tracking-tighter leading-tight">Positions</h1>
          <div className="text-medium">A list of your Uniswap V3 positions.</div>
        </div>
        <div className="flex w-full lg:w-2/3 xl:w-1/2">
          <Card>
            <div className="text-1.25 md:text-1.75 my-1 font-semibold text-high">
              {formatCurrencyWithSymbol(totalLiquidity, 1)}
            </div>
            <div className="text-0.875 md:text-1 text-medium">Total Liquidity</div>
          </Card>
          <Card className="ml-1 md:ml-2">
            <div className="text-1.25 md:text-1.75 my-1 font-semibold text-high">
              {formatCurrencyWithSymbol(totalUncollectedFees, 1)}
            </div>
            <div className="text-0.875 md:text-1 text-medium">Uncollected Fees</div>
          </Card>
          <Card className="ml-1 md:ml-2">
            <div className="text-1.25 md:text-1.75 my-1 font-semibold">
              {formatCurrencyWithSymbol(totalLiquidity + totalUncollectedFees, 1)}
            </div>
            <div className="text-0.875 md:text-1 text-brand-dark-primary">Total Value</div>
          </Card>
        </div>
      </div>
      <div className="w-full mt-5 md:mt-10">
        <div className="flex justify-between items-center">
          <FilterClosedToggle />
          <div className="flex">
            <div className="ml-2 hidden md:flex">
              <DownloadCSV />
            </div>
            <Button href="/add/new" size="md" className="ml-2">
              <div className="flex items-center -ml-1">
                <Plus />
                <span className="ml-1">New Position</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full flex-col mt-4 flex justify-center">
        {empty ? (
          <div className="py-12 rounded-lg">
            <div className="text-center text-1 md:text-1 text-low mt-4">
              This address has no position history.
            </div>
            <Link
              to={ROUTES.ADD_NEW}
              className="block text-center text-1 text-blue-primary font-medium py-2"
            >
              + Add Liquidity
            </Link>
          </div>
        ) : (
          <>
            {sortedPools.map(
              ({
                entity,
                quoteToken,
                baseToken,
                positions,
                address,
                key,
                poolLiquidity,
                poolUncollectedFees,
              }: PoolState) => (
                <Link
                  key={key}
                  to={`${ROUTES.POOL_DETAILS}/${address}`}
                  className="flex justify-between text-2xl text-medium px-4 py-4 md:py-6 border-b border-element-10 hover:bg-surface-5 transition-colors cursor-pointer"
                >
                  <PoolButton
                    baseToken={baseToken}
                    quoteToken={quoteToken}
                    fee={entity.fee / 10000}
                    showNetwork={true}
                    onClick={() => {}}
                  />
                  <div className="flex items-center">
                    <PositionStatuses
                      tickCurrent={entity.tickCurrent}
                      positions={positions.map(({ entity }) => entity)}
                    />
                    <div className="text-lg rounded-md text-high ml-2 font-medium">
                      {convertToGlobalFormatted(poolLiquidity.add(poolUncollectedFees))}
                    </div>
                  </div>
                </Link>
              ),
            )}
          </>
        )}
      </div>
      <div className="justify-end flex mt-4">
        <LastUpdatedStamp
          loading={loading || refreshingList}
          lastLoaded={lastLoaded}
          refresh={refresh}
        />
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
