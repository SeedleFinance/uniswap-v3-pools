import React, { ReactNode, useContext, useState } from "react";
import { Token } from "@uniswap/sdk-core";

import { USDC } from "./constants";

const AppSettingsContext = React.createContext(null as any);
export const useAppSettings = () => useContext(AppSettingsContext);

interface Props {
  children: ReactNode;
}

export const AppSettingsProvider = ({ children }: Props) => {
  const [filterClosed, setFilterClosed] = useState(false);
  const [globalCurrency, setGlobalCurrency] = useState<Token>(USDC);

  return (
    <AppSettingsContext.Provider
      value={{
        filterClosed,
        setFilterClosed,
        globalCurrency,
        setGlobalCurrency,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};
