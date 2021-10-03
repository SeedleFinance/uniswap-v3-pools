import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { Pool } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";

import NewPool from "./NewPool";
import ExistingPools from "./ExistingPools";
import NewPosition from "./NewPosition";

interface Props {
  tab: string;
}

function AddLiquidity({ tab }: Props) {
  const history = useHistory();

  const [selectedTab, setSelectedTab] = useState("new");
  const [selectedBaseToken, setSelectedBaseToken] =
    useState<Token | null>(null);
  const [selectedQuoteToken, setSelectedQuoteToken] =
    useState<Token | null>(null);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [selectedPositions, setSelectedPositions] =
    useState<any[] | null>(null);

  useEffect(() => {
    if (tab !== "") {
      setSelectedTab(tab);
    }
  }, [tab]);

  const resetSelections = () => {
    setSelectedBaseToken(null);
    setSelectedQuoteToken(null);
    setSelectedPool(null);
    setSelectedPositions(null);
  };

  const handleExistingPoolClick = (
    baseToken: Token,
    quoteToken: Token,
    pool: Pool,
    positions: any[]
  ) => {
    setSelectedBaseToken(baseToken);
    setSelectedQuoteToken(quoteToken);
    setSelectedPool(pool);
    setSelectedPositions(positions);
  };

  const handleNewTabClick = () => {
    resetSelections();
    history.push("/add/new");
  };

  const handleExistingTabClick = () => {
    resetSelections();
    history.push("/add/existing");
  };

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
            onClick={handleNewTabClick}
          >
            New
          </button>
          <button
            className={`p-2 border-b-4 focus:outline-none ${
              selectedTab === "existing"
                ? "border-green-500"
                : "border-transparent"
            }`}
            onClick={handleExistingTabClick}
          >
            Existing
          </button>
        </div>

        <div className="py-4 px-2">
          {selectedPool !== null ? (
            <NewPosition
              baseToken={selectedBaseToken as Token}
              quoteToken={selectedQuoteToken as Token}
              pool={selectedPool}
              positions={selectedPositions}
              onCancel={() => resetSelections()}
            />
          ) : selectedTab === "new" ? (
            <NewPool />
          ) : (
            <ExistingPools onPoolClick={handleExistingPoolClick} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AddLiquidity;
