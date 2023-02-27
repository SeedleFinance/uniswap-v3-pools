import React, { useMemo } from 'react';

import { ROUTES } from '../../common/constants';
import { useCurrencyConversions } from '../../providers/CurrencyConversionProvider';
import { usePools } from '../../providers/CombinedPoolsProvider';

import BackArrow from '../../components/icons/LeftArrow';
import Card from '../../components/Card';
import PoolButton from '../../components/PoolButton';
import LastUpdatedStamp from '../../components/LastUpdatedStamp';
import Pool from './Pool';
import Positions from './Positions';
import ChartLayout from './Chart';
import DropdownMenu from '../../components/DropdownMenu';
import IconDownload from '../../components/icons/Download';
import Button from '../../components/Button';
import IconOptions from '../../components/icons/Options';
import Plus from '../../components/icons/Plus';
import { useRouter } from 'next/router';
import Link from 'next/link';

const PoolDetailsPage = () => {
  const { loading: loadingPools, pools, lastLoaded, refresh, refreshingList } = usePools();
  const { convertToGlobalFormatted } = useCurrencyConversions();
  const { query } = useRouter();

  const id = query.id;

  // Select a single pool
  const pool = useMemo(() => {
    if (loadingPools) {
      return null;
    }

    return pools.find((pool) => pool.address === id);
  }, [loadingPools, pools, id]);

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

  function handleClickDownloadCSV() {}

  return (
    <div className="flex flex-col w-full">
      <Link href={`${ROUTES.HOME}${location.search}`}>
        <a className="text-0.875 font-medium text-medium flex items-center">
          <BackArrow />
          <span className="ml-2">Home</span>
        </a>
      </Link>
      <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center mt-4">
        <div className="flex mt-8 md:mt-0">
          <PoolButton
            baseToken={baseToken}
            quoteToken={quoteToken}
            fee={entity.fee / 10000}
            showNetwork={true}
            onClick={() => {}}
            size="lg"
          />
          <div className="hidden lg:flex flex-col ml-6 mt-8 md:-mt-3">
            <span className="text-medium text-0.6875">
              Current Price ({baseToken.symbol === 'WETH' ? 'ETH' : baseToken.symbol})
            </span>
            <span className="text-1.25 lg:text-2 font-semibold text-high">{currentPrice}</span>
          </div>
        </div>
        <div className="flex justify-end gap-2 w-full lg:w-1/3">
          <Card>
            <div className="text-0.875 text-medium whitespace-nowrap">Uncollected Fees</div>
            <div className="text-1.25 md:text-1.75 my-1 font-semibold text-high">
              {convertToGlobalFormatted(poolUncollectedFees)}
            </div>
          </Card>
          <Card>
            <div className="text-0.875  text-brand-dark-primary">Total Value</div>
            <div className="text-1.25 md:text-1.75 my-1 font-semibold">
              {convertToGlobalFormatted(poolUncollectedFees.add(poolLiquidity))}
            </div>
          </Card>
        </div>
      </div>
      <div className="w-full mt-5 md:mt-10">
        <div className="flex justify-between items-center">
          <LastUpdatedStamp
            loading={loadingPools || refreshingList}
            lastLoaded={lastLoaded}
            refresh={refresh}
            className="text-0.75"
          />
          <div className="flex items-center">
            <Button
              href={`/add?quoteToken=${quoteToken.symbol}&baseToken=${baseToken.symbol}&fee=3000`}
              size="md"
              className="ml-2"
            >
              <div className="flex items-center -ml-1">
                <Plus />
                <span className="ml-1">New Position</span>
              </div>
            </Button>
            <DropdownMenu
              options={[
                {
                  label: 'Download CSV',
                  cb: handleClickDownloadCSV,
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
      <div className="mt-8">
        <span className="text-1.25 font-semibold text-high">Overview</span>
        <Pool
          key={key}
          address={address}
          entity={entity}
          quoteToken={quoteToken}
          baseToken={baseToken}
          positions={positions}
          rawPoolLiquidity={rawPoolLiquidity}
          poolLiquidity={poolLiquidity}
          currencyPoolUncollectedFees={currencyPoolUncollectedFees}
          poolUncollectedFees={poolUncollectedFees}
        />
      </div>
      <div className="mt-8">
        <span className="text-1.25 font-semibold text-high">Price</span>
        <ChartLayout
          address={address}
          baseToken={baseToken}
          quoteToken={quoteToken}
          entity={entity}
          currentPrice={currentPrice}
          className="mt-4"
        />
      </div>
      <div className="mt-8">
        <span className="text-1.25 font-semibold text-high">Positions</span>
        <Positions
          positions={positions}
          pool={entity}
          baseToken={baseToken}
          quoteToken={quoteToken}
        />
      </div>
    </div>
  );
};

export default PoolDetailsPage;
