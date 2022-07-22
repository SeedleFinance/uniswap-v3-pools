import React, { useMemo } from 'react';
import { WETH9 } from '@uniswap/sdk-core';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { CombinedPoolsProvider, usePools } from '../../CombinedPoolsProvider';
import { useCurrencyConversions } from '../../CurrencyConversionsProvider';

import BackArrow from '../../icons/LeftArrow';
import Card from '../../ui/Card';
import PoolButton from '../../ui/PoolButton';
import DownloadCSV from '../../ui/DownloadCSV';
import LastUpdatedStamp from '../../ui/LastUpdatedStamp';
import Pool from './Pool';
import Positions from './Positions';
import ChartLayout from './Chart';
import { tickToPrice } from '@uniswap/v3-sdk';
import { formatInput } from '../../utils/numbers';

const PoolDetailsPage = () => {
  const { loading, pools } = usePools();
  const { convertToGlobal } = useCurrencyConversions();
  const { id } = useParams();
  const { loading: loadingPools, lastLoaded, refresh, refreshingList } = usePools();

  // Select a single pool
  const pool = useMemo(() => {
    if (loading) {
      return [];
    }

    return pools.filter((pool) => pool.address === id)[0];
  }, [loading, pools, id]);

  const {
    key,
    address,
    entity,
    quoteToken,
    baseToken,
    positions,
    rawPoolLiquidity,
    poolLiquidity,
    poolUncollectedFees,
  } = pool;

  const currentPrice = useMemo(() => {
    if (!pool || !baseToken || !quoteToken) {
      return '0';
    }
    const { tick } = pool;
    const price = parseFloat(tickToPrice(quoteToken, baseToken, tick).toSignificant(8));

    return price;
  }, [pool, baseToken, quoteToken]);

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
      <Link to={`${ROUTES.HOME}`} className="text-0.875 font-medium text-medium flex items-center">
        <BackArrow />
        <span className="ml-2">All positions</span>
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
              Current Price ({baseToken.equals(WETH9[baseToken.chainId]) ? 'ETH' : baseToken.symbol}
              )
            </span>
            <span className="text-1.25 lg:text-2 font-semibold text-high">{currentPrice}</span>
          </div>
        </div>
        <div className="flex lg:ml-6 w-full lg:w-1/3">
          <Card className="md:ml-2">
            <div className="text-1.25 md:text-1.75 my-1 font-semibold text-high">
              {convertToGlobal(poolUncollectedFees).toFixed(2)}
            </div>
            <div className="text-0.875 md:text-1 text-medium">Uncollected Fees</div>
          </Card>
          <Card className="ml-1 md:ml-2">
            <div className="text-1.25 md:text-1.75 my-1 font-semibold">
              {(convertToGlobal(poolUncollectedFees) + convertToGlobal(poolLiquidity)).toFixed(2)}
            </div>
            <div className="text-0.875 md:text-1 text-brand-dark-primary">Total Value</div>
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
          <div className="ml-2 hidden md:flex">
            <DownloadCSV />
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

function PoolDetailsPageWrapped() {
  return (
    <CombinedPoolsProvider>
      <PoolDetailsPage />
    </CombinedPoolsProvider>
  );
}

export default PoolDetailsPageWrapped;
