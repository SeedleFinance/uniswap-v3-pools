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
    <div className="p-2 mx-2 rounded-md border border-slate-200 dark:border-slate-700 relative text-gray-800 dark:text-slate-200">
      <button
        className="focus:outline-none"
        onClick={() => setSelectorExpanded(!selectorExpanded)}
      >
        <span>{globalCurrency === "eth" ? "ETH" : "USD"}</span>
        <span className="pl-1 text-xl">▿</span>
      </button>

      {selectorExpanded && (
        <div className="absolute p-2 rounded-md border border-slate-200 dark:border-slate-700  bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 top-12 left-0">
          <button onClick={() => handleSelection("eth")}>ETH</button>
          <button onClick={() => handleSelection("usd")}>USD</button>
        </div>
      )}
    </div>
  );
}

export default GlobalCurrencySelector;
