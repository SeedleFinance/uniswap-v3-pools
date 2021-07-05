import React, { useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ChainId, WETH9, Token } from "@uniswap/sdk-core";

import { USDC } from "./constants";
import { useGlobalCurrency } from "./GlobalCurrencyProvider";

function GlobalCurrencySelector() {
  const { chainId } = useWeb3React();
  const { globalCurrency, setGlobalCurrency } = useGlobalCurrency();
  const [selectorExpanded, setSelectorExpanded] = useState(false);

  const eth = WETH9[chainId as ChainId];
  const usd = USDC;

  const handleSelection = (val: Token) => {
    setGlobalCurrency(val);
    setSelectorExpanded(false);
  };

  return (
    <div className="p-2 rounded-md border relative">
      <button
        className="focus:outline-none"
        onClick={() => setSelectorExpanded(!selectorExpanded)}
      >
        {globalCurrency.equals(eth) ? "ETH" : "USD"}
      </button>

      {selectorExpanded && (
        <div className="absolute p-2 rounded-md border bg-white top-11 left-0">
          <button onClick={() => handleSelection(eth)}>ETH</button>
          <button onClick={() => handleSelection(usd)}>USD</button>
        </div>
      )}
    </div>
  );
}

export default GlobalCurrencySelector;
