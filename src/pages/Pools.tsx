import React from "react";
import { Link } from "react-router-dom";

import { usePools } from "../PoolsProvider";
import { PoolState } from "../hooks/usePoolsState";
import Pool from "../Pool";
import FilterClosedToggle from "../FilterClosedToggle";
import DownloadCSV from "../DownloadCSV";

function Pools() {
  const {
    pools,
    totalLiquidity,
    totalUncollectedFees,
    formatCurrencyWithSymbol,
  } = usePools();

  if (!pools.length) {
    return (
      <div className="my-16 flex items-center justify-center">
        <div className="text-center text-2xl text-gray-400">
          Loading pools...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
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
          <div className="border rounded-md p-6 mx-2">
            <div className="text-2xl text-gray-600 my-1 font-bold">
              {formatCurrencyWithSymbol(totalLiquidity)}
            </div>
            <div className="text-md text-gray-500">Total Liquidity</div>
          </div>
          <div className="border rounded-md p-6 mx-2">
            <div className="text-2xl text-gray-600 my-1 font-bold">
              {formatCurrencyWithSymbol(totalUncollectedFees)}
            </div>
            <div className="text-md text-gray-500">Total Uncollected Fees</div>
          </div>
          <div className="border rounded-md p-6 mx-2">
            <div className="text-2xl text-gray-800 my-1 font-bold">
              {formatCurrencyWithSymbol(totalLiquidity + totalUncollectedFees)}
            </div>
            <div className="text-md text-gray-500">Total Value</div>
          </div>
        </div>
      </div>
      <div className="w-full">
        {pools.map(
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
        )}
      </div>
    </div>
  );
}

export default Pools;
