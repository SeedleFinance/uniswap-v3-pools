import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { Link, useHistory, useParams } from "react-router-dom";
import { Token } from "@uniswap/sdk-core";

import NewPool from "./NewPool";
import ExistingPools from "./ExistingPools";
import NewPosition from "./NewPosition";

interface Props {
  tab: string;
}

interface TokenListItem {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

function AddLiquidity({ tab }: Props) {
  const { chainId } = useWeb3React();
  const history = useHistory();
  const { baseTokenSymbol, quoteTokenSymbol, fee } = useParams<any>();

  const [tokens, setTokens] = useState<TokenListItem[]>([]);
  const [selectedTab, setSelectedTab] = useState("new");
  const [selectedBaseToken, setSelectedBaseToken] =
    useState<Token | null>(null);
  const [selectedQuoteToken, setSelectedQuoteToken] =
    useState<Token | null>(null);
  const [selectedFee, setSelectedFee] = useState<number | null>(null);
  const [selectedPositions, setSelectedPositions] =
    useState<any[] | null>(null);

  useEffect(() => {
    const loadTokens = async () => {
      const res = await fetch("https://tokens.coingecko.com/uniswap/all.json");
      if (!res.ok) {
        setTokens([]);
        return;
      }

      const json = await res.json();
      setTokens(json.tokens);
    };

    loadTokens();
  }, []);

  useEffect(() => {
    if (tab !== "") {
      setSelectedTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    if (!chainId || !tokens || !baseTokenSymbol || !quoteTokenSymbol || !fee) {
      return;
    }
    const matches = tokens.filter(
      (token: TokenListItem) =>
        token.chainId === chainId &&
        (token.symbol === baseTokenSymbol || token.symbol === quoteTokenSymbol)
    );

    // invalid tokens
    if (matches.length !== 2) {
      return;
    }

    const toToken = ({ address, decimals, symbol, name }: TokenListItem) => {
      return new Token(chainId as number, address, decimals, symbol, name);
    };

    const [baseToken, quoteToken] =
      matches[0].symbol === baseTokenSymbol
        ? [toToken(matches[0]), toToken(matches[1])]
        : [toToken(matches[1]), toToken(matches[0])];

    setSelectedBaseToken(baseToken);
    setSelectedQuoteToken(quoteToken);
    setSelectedFee(parseInt(fee, 10));
  }, [chainId, tokens, baseTokenSymbol, quoteTokenSymbol, fee]);

  const resetSelections = () => {
    setSelectedBaseToken(null);
    setSelectedQuoteToken(null);
    setSelectedFee(null);
    setSelectedPositions(null);
  };

  const handleExistingPoolClick = (
    baseToken: Token,
    quoteToken: Token,
    fee: number,
    positions: any[]
  ) => {
    setSelectedBaseToken(baseToken);
    setSelectedQuoteToken(quoteToken);
    setSelectedFee(fee);
    setSelectedPositions(positions);
    history.push(`/add/${quoteToken.symbol}/${baseToken.symbol}/${fee}`);
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
          {selectedBaseToken !== null &&
          selectedQuoteToken !== null &&
          selectedFee != null ? (
            <NewPosition
              baseToken={selectedBaseToken as Token}
              quoteToken={selectedQuoteToken as Token}
              initFee={selectedFee}
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
