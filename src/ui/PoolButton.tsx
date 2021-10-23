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
}

function PoolButton({ baseToken, quoteToken, fee, onClick, tabIndex }: Props) {
  return (
    <button
      className="focus:outline-none flex items-center p-1"
      tabIndex={tabIndex || 0}
      onClick={onClick}
    >
      <div className="flex mr-4">
        <TokenLogo name={quoteToken.name} address={quoteToken.address} />
        <TokenLogo name={baseToken.name} address={baseToken.address} />
      </div>
      <div>
        <TokenLabel name={quoteToken.name} symbol={quoteToken.symbol} />
        <span className="px-1">/</span>
        <TokenLabel name={baseToken.name} symbol={baseToken.symbol} />
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
