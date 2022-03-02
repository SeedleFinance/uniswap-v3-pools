import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Token } from "@uniswap/sdk-core";

import NewPools from "./NewPools";
import ExistingPools from "./ExistingPools";
import NewPosition from "./NewPosition";
import SearchInput from "./SearchInput";

import { usePoolsForNetwork } from "../../hooks/usePoolsForNetwork";

import { getQuoteAndBaseToken } from "../../utils/tokens";
import { injectedConnector } from "../../utils/connectors";
import { loadTokens, findTokens, TokenListItem } from "./utils";

interface Props {
  tab: string;
}

function AddLiquidity({ tab }: Props) {
  const { chainId, active, activate } = useWeb3React("injected");

  const navigate = useNavigate();
  const { baseTokenSymbol, quoteTokenSymbol, fee } = useParams<any>();

  useEffect(() => {
    if (!active) {
      activate(injectedConnector, (err) => {
        console.error(err);
      });
    }
  }, [activate, active]);

  const { pools } = usePoolsForNetwork(chainId || 1, true);

  const [tokens, setTokens] = useState<TokenListItem[]>([]);
  const [selectedTab, setSelectedTab] = useState("new");
  const [selectedBaseToken, setSelectedBaseToken] =
    useState<Token | null>(null);
  const [selectedQuoteToken, setSelectedQuoteToken] =
    useState<Token | null>(null);
  const [selectedFee, setSelectedFee] = useState<number | null>(null);
  const [selectedPositions, setSelectedPositions] =
    useState<any[] | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");

  useEffect(() => {
    if (!chainId) {
      return;
    }

    const _run = async () => {
      const results = await loadTokens(chainId as number);
      setTokens(results);
    };

    _run();
  }, [chainId]);

  useEffect(() => {
    if (tab !== "") {
      setSelectedTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    if (!chainId || !tokens || !baseTokenSymbol || !quoteTokenSymbol || !fee) {
      return;
    }

    const matches = findTokens(chainId as number, tokens, [
      baseTokenSymbol,
      quoteTokenSymbol,
    ]);

    // invalid tokens
    if (matches.length < 2) {
      return;
    }

    const toToken = ({ address, decimals, symbol, name }: TokenListItem) => {
      return new Token(chainId as number, address, decimals, symbol, name);
    };

    const [quoteToken, baseToken] = getQuoteAndBaseToken(
      chainId as number,
      toToken(matches[0]),
      toToken(matches[1])
    );

    setSelectedBaseToken(baseToken);
    setSelectedQuoteToken(quoteToken);
    setSelectedFee(parseInt(fee, 10));
  }, [chainId, tokens, baseTokenSymbol, quoteTokenSymbol, fee]);

  // set the positions
  useEffect(() => {
    if (!pools || !selectedBaseToken || !selectedQuoteToken || !selectedFee) {
      return;
    }

    const matchingPool = pools.find(
      (p) =>
        p.baseToken.equals(selectedBaseToken) &&
        p.quoteToken.equals(selectedQuoteToken) &&
        p.entity.fee === selectedFee
    );

    if (matchingPool) {
      setSelectedPositions(matchingPool.positions);
    }
  }, [pools, selectedBaseToken, selectedQuoteToken, selectedFee]);

  const resetSelections = () => {
    setSelectedBaseToken(null);
    setSelectedQuoteToken(null);
    setSelectedFee(null);
    setSelectedPositions(null);
  };

  const handlePoolClick = (
    baseToken: Token,
    quoteToken: Token,
    fee: number,
    positions: any[]
  ) => {
    setSelectedBaseToken(baseToken);
    setSelectedQuoteToken(quoteToken);
    setSelectedFee(fee);
    setSelectedPositions(positions);
    navigate(`/add/${quoteToken.symbol}/${baseToken.symbol}/${fee}`);
  };

  const handleNewTabClick = () => {
    resetSelections();
    navigate("/add/new");
  };

  const handleExistingTabClick = () => {
    resetSelections();
    navigate("/add/existing");
  };

  const handleCancelNewPosition = () => {
    resetSelections();
    navigate("/add/new");
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
        <div className="text-slate-600 dark:text-slate-300">Add Liquidity</div>
      </div>

      <div className="w-1/2">
        <SearchInput onChange={setSearchInput} />
      </div>

      <div className="w-full py-4 my-4">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            className={`p-2 mr-2 border-b-4 focus:outline-none text-slate-600 dark:text-slate-300 ${
              selectedTab === "new" ? "border-green-500" : "border-transparent"
            }`}
            onClick={handleNewTabClick}
          >
            New
          </button>
          <button
            className={`p-2 border-b-4 focus:outline-none text-slate-600 dark:text-slate-300 ${
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
          {selectedBaseToken !== null &&
          selectedQuoteToken !== null &&
          selectedFee != null ? (
            <NewPosition
              baseToken={selectedBaseToken as Token}
              quoteToken={selectedQuoteToken as Token}
              initFee={selectedFee}
              positions={selectedPositions}
              onCancel={handleCancelNewPosition}
            />
          ) : selectedTab === "new" ? (
            <NewPools onPoolClick={handlePoolClick} filter={searchInput} />
          ) : (
            <ExistingPools
              chainId={chainId || 1}
              onPoolClick={handlePoolClick}
              filter={searchInput}
              pools={pools}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AddLiquidity;
