import React, { useState } from "react";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

import { useAppSettings } from "./AppSettingsProvider";
import Icon from "./ui/Icon";
import Menu from "./ui/Menu";

function GlobalCurrencySelector() {
  const { globalCurrency, setGlobalCurrency } = useAppSettings();
  const [selectorExpanded, setSelectorExpanded] = useState(false);

  const handleSelection = (val: string) => {
    setGlobalCurrency(val);
    setSelectorExpanded(false);
  };

  return (
    <div className="p-2 mx-1 md:mx-2 rounded-md border border-slate-200 dark:border-slate-700 relative text-gray-800 dark:text-slate-200 flex flex-shrink-0">
      <button
        className="focus:outline-none"
        onClick={() => setSelectorExpanded(!selectorExpanded)}
      >
        <span>{globalCurrency === "eth" ? "ETH" : "USD"}</span>
        <Icon className="pl-1 text-xl" icon={faCaretDown} />
      </button>

      {selectorExpanded && (
        <Menu
          className="top-12 left-0 w-16"
          onClose={() => setSelectorExpanded(false)}
        >
          <button onClick={() => handleSelection("eth")}>ETH</button>
          <button onClick={() => handleSelection("usd")}>USD</button>
        </Menu>
      )}
    </div>
  );
}

export default GlobalCurrencySelector;
