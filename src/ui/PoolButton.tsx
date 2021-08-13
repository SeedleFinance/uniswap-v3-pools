import React from "react";
import { Token } from "@uniswap/sdk-core";

import TokenLogo from "./TokenLogo";
import TokenLabel from "./TokenLabel";

interface Props {
  baseToken: Token;
  quoteToken: Token;
  fee: number;
  onClick: () => void;
}

function PoolButton({ baseToken, quoteToken, fee, onClick }: Props) {
  return (
    <button
      className="focus:outline-none flex items-center p-1"
      onClick={onClick}
    >
      <div className="flex mr-4">
        <TokenLogo name={baseToken.name} address={baseToken.address} />
        <TokenLogo name={quoteToken.name} address={quoteToken.address} />
      </div>
      <div>
        <TokenLabel name={baseToken.name} symbol={baseToken.symbol} />
        <span className="px-1">/</span>
        <TokenLabel name={quoteToken.name} symbol={quoteToken.symbol} />
      </div>
      <span className="rounded-md text-gray-800 bg-gray-200 ml-1 px-1">
        {fee}%
      </span>
    </button>
  );
}

export default PoolButton;
