import React, { useState } from "react";

import { useAppSettings } from "./AppSettingsProvider";

function GlobalCurrencySelector() {
  const { globalCurrency, setGlobalCurrency } = useAppSettings();
  const [selectorExpanded, setSelectorExpanded] = useState(false);

  const handleSelection = (val: string) => {
    setGlobalCurrency(val);
    setSelectorExpanded(false);
  };

  return (
    <div className="p-2 rounded-md border relative">
      <button
        className="focus:outline-none"
        onClick={() => setSelectorExpanded(!selectorExpanded)}
      >
        <span>{globalCurrency === "eth" ? "ETH" : "USD"}</span>
        <span className="pl-1 text-gray-800 text-xl">▿</span>
      </button>

      {selectorExpanded && (
        <div className="absolute p-2 rounded-md border bg-white top-12 left-0">
          <button onClick={() => handleSelection("eth")}>ETH</button>
          <button onClick={() => handleSelection("usd")}>USD</button>
        </div>
      )}
    </div>
  );
}

export default GlobalCurrencySelector;
