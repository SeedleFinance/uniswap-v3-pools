import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { usePools } from "../PoolsProvider";
import { useAppSettings } from "../AppSettingsProvider";
import { PoolState } from "../hooks/usePool";
import PoolButton from "../ui/PoolButton";

function NewPool() {
  return <div>New pool</div>;
}

function ExistingPools() {
  const { pools } = usePools();
  const { filterClosed, setFilterClosed } = useAppSettings();

  useEffect(() => {
    const currentFilterClosed = filterClosed;
    if (currentFilterClosed) {
      setFilterClosed(false);
    }

    return function reset() {
      if (currentFilterClosed) {
        setFilterClosed(true);
      }
    };
  }, []); // this should run only on mount/unmount

  if (!pools.length) {
    return <div>Loading pools...</div>;
  }

  return (
    <div className="w-full flex flex-wrap">
      {pools.map(({ key, baseToken, quoteToken, entity }: PoolState) => (
        <div className="w-96 border border-gray-400 rounded m-3 p-3 text-lg">
          <PoolButton
            key={key}
            baseToken={baseToken}
            quoteToken={quoteToken}
            fee={entity.fee / 10000}
            onClick={() => {}}
          />
        </div>
      ))}
    </div>
  );
}

function AddLiquidity() {
  const [selectedTab, setSelectedTab] = useState("new");

  return (
    <div className="w-full flex flex-col">
      <div className="py-4 mb-4 flex items-center text-2xl w-2/12">
        <Link
          to="/"
          className="flex justify-center text-gray-500 w-8 h-8 mr-4 rounded-full hover:bg-gray-200"
        >
          <span>←</span>
        </Link>
        <div>Add Liquidity</div>
      </div>

      <div className="w-1/2">
        <input
          className="w-full rounded border border-gray-200 p-2 focus:outline-none focus:border-gray-500"
          type="text"
          placeholder="Search by tokens"
        />
      </div>

      <div className="w-full py-4 my-4">
        <div className="flex border-b border-gray-200">
          <button
            className={`p-2 mr-2 border-b-4 focus:outline-none ${
              selectedTab === "new" ? "border-green-500" : "border-transparent"
            }`}
            onClick={() => setSelectedTab("new")}
          >
            New
          </button>
          <button
            className={`p-2 border-b-4 focus:outline-none ${
              selectedTab === "existing"
                ? "border-green-500"
                : "border-transparent"
            }`}
            onClick={() => setSelectedTab("existing")}
          >
            Existing
          </button>
        </div>

        <div className="py-4 px-2">
          {selectedTab === "new" ? <NewPool /> : <ExistingPools />}
        </div>
      </div>
    </div>
  );
}

export default AddLiquidity;
