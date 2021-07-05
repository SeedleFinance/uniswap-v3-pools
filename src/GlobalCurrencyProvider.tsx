import React, { ReactNode, useContext, useState } from "react";
import { Token } from "@uniswap/sdk-core";

import { USDC } from "./constants";

const GlobalCurrencyContext = React.createContext(null as any);
export const useGlobalCurrency = () => useContext(GlobalCurrencyContext);

interface Props {
  children: ReactNode;
}

export const GlobalCurrencyProvider = ({ children }: Props) => {
  const [globalCurrency, setGlobalCurrency] = useState<Token>(USDC);

  return (
    <GlobalCurrencyContext.Provider
      value={{
        globalCurrency,
        setGlobalCurrency,
      }}
    >
      {children}
    </GlobalCurrencyContext.Provider>
  );
};
