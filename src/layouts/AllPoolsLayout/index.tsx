import { useMemo } from 'react';
import Link from 'next/link';

import { PoolState } from '../../types/seedle';
import { LABELS, ROUTES } from '../../common/constants';

import { useAppSettings } from '../../providers/AppSettingsProvider';
import { usePools } from '../../providers/CombinedPoolsProvider';
import { useCurrencyConversions } from '../../providers/CurrencyConversionProvider';
import { useCSV } from '../../hooks/useCSV';

import Button from '../../components/Button';
import Card from '../../components/Card';
import LastUpdatedStamp from '../../components/LastUpdatedStamp';
import Plus from '../../components/icons/Plus';
import Tooltip from '../../components/Tooltip';
import IconHelper from '../../components/icons/Helper';
import DropdownMenu from '../../components/DropdownMenu';
import IconOptions from '../../components/icons/Options';
import IconDownload from '../../components/icons/Download';
// import FilterClosedToggle from '../../components/FilterClosedToggle';
import Row from '../../components/Row';
import BackArrow from '../../components/icons/LeftArrow';
import { useRouter } from 'next/router';

function AllPoolsLayout() {
  const { filterClosed } = useAppSettings();
  const { convertToGlobal, formatCurrencyWithSymbol } = useCurrencyConversions();
  const router = useRouter();

  const { loading, empty, pools, lastLoaded, refresh, refreshingList } = usePools();
  // const location = useLocation();
  const handleDownloadCSV = useCSV();

  // sort pools by liquidity
  const sortedPools = useMemo(() => {
    if (loading) {
      return [];
    }

    return pools
      .filter((pool) => (filterClosed ? !pool.rawPoolLiquidity.isZero() : true))
      .sort((a, b) => {
        const aLiq = convertToGlobal(a.poolLiquidity);
        const bLiq = convertToGlobal(b.poolLiquidity);
        return bLiq - aLiq;
      });
  }, [loading, pools, convertToGlobal, filterClosed]);

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
    router.push(`${ROUTES.POOL_DETAILS}/${address}${location.search}`);
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
      <Link href={`${ROUTES.HOME}${location.search}`}>
        <a className="text-0.875 font-medium text-medium flex items-center">
          <BackArrow />
          <span className="ml-2">Home</span>
        </a>
      </Link>
      <div className="flex flex-col-reverse md:flex-row md:justify-between items-center">
        <div className="hidden md:flex w-1/2 flex-col text-high">
          <h1 className="text-2.5 font-bold tracking-tighter leading-tight">Pools</h1>
          <div className="text-medium">Uniswap V3 positions.</div>
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

      <div className="w-full mt-4 md:mt-12">
        <div className="flex justify-between items-center">
          {/* <FilterClosedToggle /> */}
          <div className="flex">
            <Button href="/add/new" size="md" className="ml-2">
              <div className="flex items-center -ml-1">
                <Plus />
                <span className="ml-1">New Position</span>
              </div>
            </Button>
            <DropdownMenu
              options={[
                {
                  label: 'Download CSV',
                  cb: handleDownloadCSV,
                  icon: <IconDownload />,
                },
              ]}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <IconOptions />
              </div>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="w-full flex-col mt-4 flex justify-center overflow-x-auto">
        {empty ? (
          <div className="py-12 rounded-lg">
            <div className="text-center text-1 md:text-1 text-low mt-4">
              This address has no positions.
            </div>
            <Link
              href={ROUTES.ADD_NEW}
              className="block text-center text-1 text-blue-primary font-medium py-2"
            >
              + Add Liquidity
            </Link>
          </div>
        ) : (
          <>
            <table className="table-auto w-full text-high text-0.875 overflow-x-auto">
              <thead className="border-b border-element-10">
                <tr className="align-middle">
                  <th className="md:px-6 py-4 whitespace-nowrap font-medium text-left">Pool</th>
                  <th className="text-right px-6 py-4 whitespace-nowrap font-medium">
                    Current Price
                  </th>
                  <th className="text-right px-6 py-4 whitespace-nowrap font-medium">
                    <Tooltip label={LABELS.LIQUIDITY} placement="top-end">
                      <span className="flex items-center justify-end">
                        Liquidity
                        <IconHelper className="ml-1" />
                      </span>
                    </Tooltip>
                  </th>
                  <th className="text-right px-6 py-4 whitespace-nowrap font-medium">
                    Uncollected Fees
                  </th>
                  <th className="text-right px-6 py-4 whitespace-nowrap font-medium">
                    <Tooltip label={LABELS.FEE_APY} placement="top">
                      <span className="flex items-center justify-end cursor-default whitespace-nowrap">
                        Fee APY
                        <IconHelper className="ml-1" />
                      </span>
                    </Tooltip>
                  </th>
                  <th className="text-right px-2 md:px-6 py-4 whitespace-nowrap font-medium">
                    <span className="flex items-center justify-end cursor-default whitespace-nowrap">
                      Status
                    </span>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortedPools.map(
                  ({
                    key,
                    address,
                    entity,
                    quoteToken,
                    baseToken,
                    currentPrice,
                    positions,
                    poolLiquidity,
                    poolUncollectedFees,
                    currencyPoolUncollectedFees,
                  }: PoolState) => (
                    <Row
                      key={key}
                      onClick={() => handleRowClick(address)}
                      entity={entity}
                      quoteToken={quoteToken}
                      baseToken={baseToken}
                      poolLiquidity={poolLiquidity}
                      poolUncollectedFees={poolUncollectedFees}
                      currencyPoolUncollectedFees={currencyPoolUncollectedFees}
                      currentPrice={currentPrice}
                      positions={positions}
                    />
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

export default AllPoolsLayout;
