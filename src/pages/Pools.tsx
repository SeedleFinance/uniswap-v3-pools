import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import { CombinedPoolsProvider, usePools } from "../CombinedPoolsProvider";
import { PoolState } from "../hooks/usePoolsState";
import { useCurrencyConversions } from "../CurrencyConversionsProvider";
import Pool from "../Pool";
import FilterClosedToggle from "../FilterClosedToggle";
import DownloadCSV from "../DownloadCSV";

function Pools() {
  const { convertToGlobal, formatCurrencyWithSymbol } =
    useCurrencyConversions();

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
      [0, 0]
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
      <div className="my-4 p-2 bg-yellow-100 rounded">
        <a
          href="https://donate.uniswap.org/#/swap"
          className="w-full text-blue-500 font-bold underline text-center"
        >
          Donate to Ukraine
        </a>
        <span className="ml-2">
          Swap and donate any ERC-20 token via Uniswap
        </span>
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center justify-between w-5/12  pr-24">
          <div>
            <Link
              to="/add/new"
              className="block bg-gradient-to-b from-green-400 to-green-600 text-white p-2 bg-gray-100 rounded focus:outline-none"
            >
              Add liquidity
            </Link>
          </div>
          <FilterClosedToggle />
          <DownloadCSV />
        </div>
        <div className="flex flex-row justify-end">
          <div className="border border-slate-200 dark:border-slate-700 rounded-md p-6 mx-2">
            <div className="text-2xl text-slate-600 dark:text-slate-300 my-1 font-bold">
              {formatCurrencyWithSymbol(totalLiquidity, 1)}
            </div>
            <div className="text-md text-slate-500 dark:text-slate-400">
              Total Liquidity
            </div>
          </div>
          <div className="border border-slate-200 dark:border-slate-700 rounded-md p-6 mx-2">
            <div className="text-2xl text-slate-600 dark:text-slate-300 my-1 font-bold">
              {formatCurrencyWithSymbol(totalUncollectedFees, 1)}
            </div>
            <div className="text-md text-slate-500 dark:text-slate-400">
              Total Uncollected Fees
            </div>
          </div>
          <div className="border border-slate-200 dark:border-slate-700 rounded-md p-6 mx-2">
            <div className="text-2xl text-slate-600 dark:text-slate-300 my-1 font-bold">
              {formatCurrencyWithSymbol(
                totalLiquidity + totalUncollectedFees,
                1
              )}
            </div>
            <div className="text-md text-slate-500 dark:text-slate-400">
              Total Value
            </div>
          </div>
        </div>
      </div>
      <div className="w-full">
        {empty ? (
          <>
            <div className="text-center text-2xl text-slate-600 dark:text-slate-300 m-8">
              This address do not have any Uniswap LP positions.
            </div>
            <Link
              to="/add/new"
              className="block text-center text-xl text-blue-500 dark:text-blue-200 m-8"
            >
              Add Liquidity
            </Link>
          </>
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
            )
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
