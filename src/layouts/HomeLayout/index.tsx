import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import JSBI from 'jsbi';

import Button from '../../components/Button';
import Card from '../../components/Card';
import CopyIcon from '../../components/icons/Copy';
import Plus from '../../components/icons/Plus';
import TokenList from '../TokenListLayout';

import { useAddress } from '../../providers/AddressProvider';
import { usePools } from '../../providers/CombinedPoolsProvider';
import { useTokens } from '../../providers/CombinedTokensProvider';
import { useCurrencyConversions } from '../../providers/CurrencyConversionProvider';

import { shortenAddress } from '../../utils/shortenAddress';
import { LABELS, ROUTES } from '../../common/constants';
import { ChainID } from '../../types/enums';
import Tooltip from '../../components/Tooltip';
import Helper from '../../components/icons/Helper';
import PoolRow from '../../components/PoolRow';
import LastUpdatedStamp from '../../components/LastUpdatedStamp';
import { PoolState } from '../../types/seedle';

const HomeLayout = () => {
  const { addressReady } = useAddress();
  const { convertToGlobal, formatCurrencyWithSymbol, refreshPriceFeed } = useCurrencyConversions();

  const { loading, pools, lastLoaded, refresh: refreshPools, refreshingList } = usePools();
  const router = useRouter();

  const { totalTokenValue, refreshTokenPrices } = useTokens();

  console.log('totalTokenValue', totalTokenValue);

  const { addresses } = useAddress();

  const refreshPoolsAndTokens = useCallback(() => {
    refreshPools();
    refreshPriceFeed();
    refreshTokenPrices();
  }, [refreshPools, refreshTokenPrices, refreshPriceFeed]);

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
    router.push(`${ROUTES.POOL_DETAILS}/${address}${location.search}`);
  }

  if (loading || !addressReady) {
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
            <h2 className=" font-bold text-1.25 text-high">Open Positions</h2>
            <span className="text-0.875 ml-2 text-medium flex">
              ({formatCurrencyWithSymbol(totalLiquidity + totalUncollectedFees, ChainID.Mainnet)})
            </span>
          </div>
          <div className="w-1/3 flex items-center justify-end">
            <Button href="/add?tab=new" size="md" className="ml-2 mr-4">
              <div className="flex items-center -ml-1">
                <Plus />
                <span className="ml-1">New Position</span>
              </div>
            </Button>
            <Link href={`${ROUTES.POOLS}/${location.search}`}>
              <a className="text-low text-0.875">View all</a>
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full flex-col mt-4 flex justify-center overflow-x-auto">
        {sortedPools.length === 0 ? (
          <div className="py-12 rounded-lg flex flex-col justify-center items-center">
            <div className="text-center text-1 md:text-1 text-low mt-4">
              This address has no open positions.
            </div>
            <Link href={ROUTES.ADD_NEW} className="block text-center text-1 font-medium py-2">
              <a className="text-blue-primary">+ Create a Position</a>
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
                        <Helper className="ml-1" />
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
                        <Helper className="ml-1" />
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
                    <PoolRow
                      key={key}
                      onClick={() => handleRowClick(address)}
                      entity={entity}
                      quoteToken={quoteToken}
                      baseToken={baseToken}
                      poolLiquidity={poolLiquidity}
                      poolUncollectedFees={poolUncollectedFees}
                      currencyPoolUncollectedFees={currencyPoolUncollectedFees}
                      currentPrice={currentPrice}
                      positions={positions.filter(({ entity }) =>
                        JSBI.notEqual(entity.liquidity, JSBI.BigInt(0)),
                      )}
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
          refresh={refreshPoolsAndTokens}
        />
      </div>
    </div>
  );
};

export default HomeLayout;
