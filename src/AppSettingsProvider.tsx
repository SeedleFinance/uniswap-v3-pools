import React, { ReactNode, useContext, useMemo } from "react";
import { WETH9, Token } from "@uniswap/sdk-core";
import createPersistedState from "use-persisted-state";

import { useChainId } from "./hooks/useChainId";
import { USDC } from "./constants";

const AppSettingsContext = React.createContext(null as any);
export const useAppSettings = () => useContext(AppSettingsContext);

const useFilterClosedState = createPersistedState("app-filter-closed");
const useGlobalCurrencyState = createPersistedState("app-global-currency");

interface Props {
  children: ReactNode;
}

export const AppSettingsProvider = ({ children }: Props) => {
  const chainId = useChainId();
  const [filterClosed, setFilterClosed] = useFilterClosedState(false);
  const [globalCurrency, setGlobalCurrency] = useGlobalCurrencyState("usd");

  const globalCurrencyToken = useMemo(() => {
    const tokens: { [name: string]: Token } = {
      usd: USDC,
      eth: WETH9[chainId as number],
    };
    return tokens[globalCurrency];
  }, [globalCurrency, chainId]);

  return (
    <AppSettingsContext.Provider
      value={{
        filterClosed,
        setFilterClosed,
        globalCurrency,
        globalCurrencyToken,
        setGlobalCurrency,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};
