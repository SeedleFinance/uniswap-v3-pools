import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import JSBI from 'jsbi';

import { usePools } from '../../CombinedPoolsProvider';
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
import Tooltip from '../../ui/Tooltip';
import IconHelper from '../../icons/Helper';

import { ROUTES } from '../../constants';
import { LABELS } from '../../content/tooltip';

function Pools() {
  const { convertToGlobal, formatCurrencyWithSymbol, convertToGlobalFormatted } =
    useCurrencyConversions();

  const { loading, empty, pools, lastLoaded, refresh, refreshingList } = usePools();
  const navigate = useNavigate();
  const location = useLocation();

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

  function handleRowClick(address: string) {
    navigate(`${ROUTES.POOL_DETAILS}/${address}${location.search}`);
  }

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
        <div className="flex w-full lg:w-2/3 xl:w-1/2 overflow-x-auto md:overflow-x-visible py-2">
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
            <table className="table-auto w-full text-high text-0.875">
              <thead className="border-b border-element-10">
                <tr className="text-left align-middle">
                  <th className="px-6 py-4 whitespace-nowrap font-medium">Pool</th>
                  <th className="px-6 py-4 whitespace-nowrap font-medium text-right">
                    <Tooltip label={LABELS.LIQUIDITY} placement="top-end">
                      <span className="flex items-center justify-end">
                        Total Liquidity
                        <IconHelper className="ml-1" />
                      </span>
                    </Tooltip>
                  </th>
                </tr>
              </thead>
              <tbody>
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
                    <tr
                      onClick={() => handleRowClick(address)}
                      key={key}
                      className="hover:bg-surface-5 cursor-pointer"
                    >
                      <td className="px-2 py-4 md:px-6 md:py-8 md:whitespace-nowrap">
                        <PoolButton
                          baseToken={baseToken}
                          quoteToken={quoteToken}
                          fee={entity.fee / 10000}
                          showNetwork={true}
                          size="xs"
                          onClick={() => {}}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col-reverse items-end md:flex-row md:justify-end">
                          <PositionStatuses
                            tickCurrent={entity.tickCurrent}
                            positions={positions
                              .map(({ entity }) => entity)
                              .filter(({ liquidity }) => JSBI.notEqual(liquidity, JSBI.BigInt(0)))}
                            allPositionsCounter={positions.length}
                          />
                          <div className="text-lg rounded-md text-high ml-2 font-medium text-right">
                            {convertToGlobalFormatted(poolLiquidity)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
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

export default Pools;
