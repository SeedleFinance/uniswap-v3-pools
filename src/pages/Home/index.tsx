import { useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import { PoolState } from '../../types/seedle';
import { ROUTES } from '../../constants';
import { LABELS } from '../../content/tooltip';
import { ChainID } from '../../enums';

import { usePools } from '../../CombinedPoolsProvider';
import { useTokens } from '../../CombinedTokensProvider';
import { useCurrencyConversions } from '../../CurrencyConversionsProvider';

import Button from '../../ui/Button';
import Card from '../../ui/Card';
import LastUpdatedStamp from '../../ui/LastUpdatedStamp';
import Plus from '../../icons/Plus';
import Tooltip from '../../ui/Tooltip';
import IconHelper from '../../icons/Helper';
import Row from './Row';
import TokenList from './TokenList';
import { useAddress } from '../../AddressProvider';
import { shortenAddress } from '../../utils/shortenAddress';
import CopyIcon from '../../icons/Copy';

function Home() {
  const { convertToGlobal, formatCurrencyWithSymbol } = useCurrencyConversions();

  const { loading, empty, pools, lastLoaded, refresh, refreshingList } = usePools();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalTokenValue } = useTokens();

  const { addresses } = useAddress();

  const notifyCopy = () => toast('Copied to clipboard.');

  // sort pools by liquidity
  const sortedPools = useMemo(() => {
    if (loading) {
      return [];
    }

    return pools
      .filter((pool) => !pool.rawPoolLiquidity.isZero())
      .sort((a, b) => {
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

  function handleClickCopy(text: string) {
    navigator.clipboard.writeText(text);

    // fire toast
    notifyCopy();
  }

  return (
    <div className="w-full h-full">
      <div className="flex flex-col-reverse md:flex-row md:justify-between items-center">
        <div className="hidden md:flex w-1/2 flex-col text-high">
          <h1 className="text-2.5 font-bold tracking-tighter leading-tight">Home</h1>
          <div className="text-medium flex items-center mt-1">
            A 10,000ft summary of &nbsp;
            <>
              <span className="text-high font-medium mr-1">{shortenAddress(addresses[0])}</span>
              <button onClick={() => handleClickCopy(addresses[0])}>
                <CopyIcon />
              </button>
              <Toaster />
            </>
          </div>
        </div>
        <div className="flex w-full lg:w-2/3 xl:w-1/2 overflow-x-auto md:overflow-x-visible py-2">
          <Card>
            <div className="text-1.25 md:text-1.75 my-1 font-semibold text-high">
              {formatCurrencyWithSymbol(totalLiquidity + totalTokenValue, ChainID.Mainnet)}
            </div>
            <div className="text-0.875 md:text-1 text-medium">Total Liquidity</div>
          </Card>
          <Card className="ml-1 md:ml-2">
            <div className="text-1.25 md:text-1.75 my-1 font-semibold text-high">
              {formatCurrencyWithSymbol(totalUncollectedFees, ChainID.Mainnet)}
            </div>
            <div className="text-0.875 md:text-1 text-medium">Uncollected Fees</div>
          </Card>
          <Card className="ml-1 md:ml-2">
            <div className="text-1.25 md:text-1.75 my-1 font-semibold">
              {formatCurrencyWithSymbol(
                totalLiquidity + totalTokenValue + totalUncollectedFees,
                ChainID.Mainnet,
              )}
            </div>
            <div className="text-0.875 md:text-1 text-brand-dark-primary">Total Value</div>
          </Card>
        </div>
      </div>

      <TokenList />

      <div className="w-full mt-4 md:mt-12">
        <div className="w-full flex justify-between py-4 border-b border-element-10 mb-8">
          <div className="w-2/3 flex items-center">
            <h2 className=" font-bold text-1.25 text-high">Pools</h2>
            <span className="text-0.875 ml-2 text-medium flex">
              ({formatCurrencyWithSymbol(totalLiquidity + totalUncollectedFees, ChainID.Mainnet)})
            </span>
          </div>
          <div className="w-1/3 flex items-center justify-end">
            <Button href="/add/new" size="md" className="ml-2 mr-4">
              <div className="flex items-center -ml-1">
                <Plus />
                <span className="ml-1">New Position</span>
              </div>
            </Button>
            {sortedPools.length > 0 && (
              <Link to={`${ROUTES.POOLS}/${location.search}`} className="text-low text-0.875">
                View all
              </Link>
            )}
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

export default Home;
