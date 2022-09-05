import React, { ReactNode, useContext, useCallback, useMemo } from "react";
import { Token } from "@uniswap/sdk-core";
import createPersistedState from "use-persisted-state";

import { USDC, WETH9 } from "../common/constants";

const AppSettingsContext = React.createContext(null as any);
export const useAppSettings = () => useContext(AppSettingsContext);

const useFilterClosedState = createPersistedState("app-filter-closed");
const useGlobalCurrencyState = createPersistedState("app-global-currency");
const useThemeState = createPersistedState("app-theme");

interface Props {
  children: ReactNode;
}

export const AppSettingsProvider = ({ children }: Props) => {
  const [filterClosed, setFilterClosed] = useFilterClosedState(false);
  const [globalCurrency, setGlobalCurrency] = useGlobalCurrencyState("usd");
  const [theme, setTheme] = useThemeState("");

  const getGlobalCurrencyToken = useCallback(
    (chainId: number) => {
      const tokens: { [name: string]: Token } = {
        usd: USDC[chainId],
        eth: WETH9[chainId],
      };
      return tokens[globalCurrency as any] || tokens["usd"];
    },
    [globalCurrency]
  );

  // const computedTheme = useMemo(() => {
  //   if (
  //     theme === "dark" ||
  //     (theme === "" &&
  //       window?.matchMedia("(prefers-color-scheme: dark)").matches)
  //   ) {
  //     return "dark";
  //   } else {
  //     return "light";
  //   }
  // }, [theme]);

  return (
    <AppSettingsContext.Provider
      value={{
        filterClosed,
        setFilterClosed,
        globalCurrency,
        getGlobalCurrencyToken,
        setGlobalCurrency,
        theme: "light",
        setTheme,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};
