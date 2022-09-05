import React, { useState } from "react";

import { useAppSettings } from "../../providers/AppSettingsProvider";

import Menu from "../Menu/Menu";
import Button from "../Button";

function GlobalCurrencySelector() {
  const { globalCurrency, setGlobalCurrency } = useAppSettings();
  const [selectorExpanded, setSelectorExpanded] = useState(false);

  const handleSelection = (val: string) => {
    setGlobalCurrency(val);
    setSelectorExpanded(false);
  };

  return (
    <div className="mx-1 md:mx-2 relative">
      <Button
        variant="outline"
        size="lg"
        className="focus:outline-none font-medium"
        onClick={() => setSelectorExpanded(!selectorExpanded)}
      >
        <span>{globalCurrency === "eth" ? "ETH" : "USD"}</span>
        {/* <Icon className="pl-1 text-xl" icon={faCaretDown} /> */}
      </Button>

      {selectorExpanded && (
        <Menu
          className="top-12 left-0 w-16 shadow-lg"
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
