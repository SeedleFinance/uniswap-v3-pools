import React from "react";
import { Token } from "@uniswap/sdk-core";

import TokenLogo from "./TokenLogo";
import TokenLabel from "./TokenLabel";

interface Props {
  baseToken: Token;
  quoteToken: Token;
  fee?: number;
  onClick: () => void;
  tabIndex?: number;
  showNetwork?: boolean;
}

function getChainNameAndColor(chainId: number) {
  const chains: { [id: number]: string[] } = {
    1: ["Mainnet", "bg-gray-200", "ethereum"],
    10: ["Optimism", "bg-red-200", "optimism"],
    42161: ["Arbitrum", "bg-blue-200", "arbitrum"],
    137: ["Polygon", "bg-indigo-300", "polygon"],
  };

  return chains[chainId] || chains[1];
}

function PoolButton({
  baseToken,
  quoteToken,
  fee,
  onClick,
  tabIndex,
  showNetwork,
}: Props) {
  const [chainName, chainColor, chainLogoName] = getChainNameAndColor(
    baseToken.chainId
  );
  return (
    <button
      className="focus:outline-none flex items-start p-1"
      tabIndex={tabIndex || 0}
      onClick={onClick}
    >
      <div className="flex mr-4">
        <TokenLogo
          chain={chainLogoName}
          name={quoteToken.name}
          address={quoteToken.address}
        />
        <TokenLogo
          chain={chainLogoName}
          name={baseToken.name}
          address={baseToken.address}
        />
      </div>
      <div className="flex flex-col mx-2">
        <div>
          <TokenLabel name={quoteToken.name} symbol={quoteToken.symbol} />
          <span className="px-1">/</span>
          <TokenLabel name={baseToken.name} symbol={baseToken.symbol} />
        </div>
        {showNetwork && (
          <div
            className={`rounded-md text-sm text-gray-800 mt-2 px-1 ${chainColor}`}
          >
            {chainName}
            {baseToken.symbol === "vUSD" ? " / PerpV2" : ""}
          </div>
        )}
      </div>
      {fee && (
        <span className="rounded-md text-gray-800 bg-gray-200 ml-1 px-1">
          {fee}%
        </span>
      )}
    </button>
  );
}

export default PoolButton;
