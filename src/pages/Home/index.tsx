import { useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { PoolState } from '../../types/seedle';
import { ROUTES } from '../../constants';
import { LABELS } from '../../content/tooltip';

import { usePools } from '../../CombinedPoolsProvider';
import { useCurrencyConversions } from '../../CurrencyConversionsProvider';
import { useCSV } from '../../hooks/useCSV';

import Button from '../../ui/Button';
import Card from '../../ui/Card';
import FilterClosedToggle from './FilterClosedToggle';
import LastUpdatedStamp from '../../ui/LastUpdatedStamp';
import Plus from '../../icons/Plus';
import Tooltip from '../../ui/Tooltip';
import IconHelper from '../../icons/Helper';
import Row from './Row';
import DropdownMenu from '../../ui/DropdownMenu';
import IconOptions from '../../icons/Options';
import IconDownload from '../../icons/Download';
import { useTokens } from '../../hooks/useTokens';
import { useAddress } from '../../AddressProvider';
import { shortenAddress } from '../../utils/shortenAddress';

function Pools() {
  const { convertToGlobal, formatCurrencyWithSymbol } = useCurrencyConversions();

  const { loading, empty, pools, lastLoaded, refresh, refreshingList } = usePools();
  const navigate = useNavigate();
  const location = useLocation();
  const handleDownloadCSV = useCSV();

  const { data: tokenData, loading: loadingTokens, error: errorTokens } = useTokens();

  const { addresses } = useAddress();

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
          <h1 className="text-2.5 font-bold tracking-tighter leading-tight">Home</h1>
          <div className="text-medium">
            A 10,000ft summary of{' '}
            <span className="text-high font-medium">{shortenAddress(addresses[0])}.</span>
          </div>
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

      {loadingTokens && (
        <div className="w-full">
          <div className="w-32 h-6 py-2 flex-shrink-0 bg-surface-10 mt-12 rounded-md"></div>
          <div className="w-full h-24 mt-4 flex overflow-hidden">
            <div className="w-52 bg-surface-10 h-full rounded-md flex-shrink-0"></div>
            <div className="w-52 bg-surface-10 h-full rounded-md flex-shrink-0 ml-6"></div>
            <div className="w-52 bg-surface-10 h-full rounded-md flex-shrink-0 ml-6"></div>
            <div className="w-52 bg-surface-10 h-full rounded-md flex-shrink-0 ml-6"></div>
            <div className="w-52 bg-surface-10 h-full rounded-md flex-shrink-0 ml-6"></div>
            <div className="w-52 bg-surface-10 h-full rounded-md flex-shrink-0 ml-6"></div>
          </div>
        </div>
      )}

      {tokenData && (
        <div className="w-full mt-12">
          <div className="flex justify-between w-full border-b border-element-10 py-4">
            <h2 className="leading-tight font-bold text-1.25 text-high">Tokens</h2>
            {tokenData.length > 0 && (
              <Link to={`${ROUTES.TOKENS}/${location.search}`} className="text-low text-0.875">
                View all
              </Link>
            )}
          </div>
          {tokenData && !tokenData.length && (
            <div className="text-center text-1 md:text-1 text-low mt-4 flex justify-center items-center h-20">
              This address has no tokens.
            </div>
          )}
          <div className="w-full mt-8 flex gap-20 overflow-x-auto pb-12">
            {tokenData.map((token) => (
              <div className="h-full rounded-md flex-shrink-0 flex-col flex" key={token.name}>
                <div className="flex items-start text-low">
                  <img className="w-8 h-8 mr-2" alt={`${token.name} logo`} src={token.logo} />
                  <div className="flex flex-col text-high">
                    <div className="text-1.25 font-bold leading-tight flex items-center">
                      {token.name}{' '}
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="text-0.875">${token.price.toFixed(5)}</div>
                      <div className="text-0.75 px-1 py-0.5 bg-slate-200 rounded-md ml-1 font-medium text-black">
                        {token.network}
                      </div>
                    </div>
                    <div className="text-0.875 bg-green-100 dark:bg-green-600 -ml-2 mt-2 rounded-md px-2">
                      Balance: {token.balance.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="w-full mt-4 md:mt-12">
        <div className="w-full flex justify-between py-4 border-b border-element-10 mb-8">
          <h2 className="leading-tight font-bold text-1.25 text-high">Pools</h2>
          {sortedPools.length > 0 && (
            <Link to={`${ROUTES.POOLS}/${location.search}`} className="text-low text-0.875">
              View all
            </Link>
          )}
        </div>
        <div className="flex justify-between items-center">
          <FilterClosedToggle />
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
              <Button variant="ghost">
                <IconOptions />
              </Button>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="w-full flex-col mt-4 flex justify-center overflow-x-auto">
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

export default Pools;
