import React, { ReactNode, useContext, useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import { ChainId, WETH9, Token } from "@uniswap/sdk-core";
import createPersistedState from "use-persisted-state";

import { USDC } from "./constants";

const AppSettingsContext = React.createContext(null as any);
export const useAppSettings = () => useContext(AppSettingsContext);

const useFilterClosedState = createPersistedState("app-filter-closed");
const useGlobalCurrencyState = createPersistedState("app-global-currency");

interface Props {
  children: ReactNode;
}

export const AppSettingsProvider = ({ children }: Props) => {
  const { chainId } = useWeb3React();
  const [filterClosed, setFilterClosed] = useFilterClosedState(false);
  const [globalCurrency, setGlobalCurrency] = useGlobalCurrencyState("usd");

  const globalCurrencyToken = useMemo(() => {
    const tokens: { [name: string]: Token } = {
      usd: USDC,
      eth: WETH9[chainId as ChainId],
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
