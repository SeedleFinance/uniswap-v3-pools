import React, { useContext, useState, useMemo } from "react";
import { Token } from "@uniswap/sdk-core";
import createPersistedState from "use-persisted-state";

import { USDC, WETH9 } from "./constants";

export interface Position {
  id: string;
  account: string;
  email: string;
  time: Date;
}

interface ApiResponse {
  success: boolean;
  data: {};
  error?: string;
}

interface AppSettingsContext {
  filterClosed: boolean;
  setFilterClosed(flag: React.SetStateAction<boolean>): void;
  globalCurrency: {};
  getGlobalCurrencyToken(chainId: number): void;
  setGlobalCurrency(currency: React.SetStateAction<string>): void;
  theme: string;
  setTheme(theme: React.SetStateAction<string>): void;
  openPositions: Position[];
  addPosition(
    position: Omit<Position, "id" | "time">
  ): Promise<ApiResponse | void>;
  removePosition(id: string): Promise<ApiResponse | void>;
  setShowPositionsModal(flag: React.SetStateAction<boolean>): void;
  showPositionsModal: boolean;
}

const AppSettingsContext = React.createContext<AppSettingsContext>({
  filterClosed: true,
  setFilterClosed: () => {},
  globalCurrency: {},
  getGlobalCurrencyToken: () => {},
  setGlobalCurrency: () => {},
  theme: "light",
  setTheme: () => {},
  openPositions: [],
  addPosition: async () => {},
  removePosition: async () => {},
  setShowPositionsModal: () => {},
  showPositionsModal: false,
});

export const useAppSettings = () => useContext(AppSettingsContext);
const useFilterClosedState = createPersistedState("app-filter-closed");
const useGlobalCurrencyState = createPersistedState("app-global-currency");
const useThemeState = createPersistedState("app-theme");

export const AppSettingsProvider: React.FC = ({ children }) => {
  const [filterClosed, setFilterClosed] = useFilterClosedState(false);
  const [globalCurrency, setGlobalCurrency] = useGlobalCurrencyState("usd");
  const [theme, setTheme] = useThemeState("");
  const [openPositions, setOpenPositions] = useState<Position[]>([]);
  const [showPositionsModal, setShowPositionsModal] = useState(false);

  const contextValue = useMemo(() => {
    const addPosition = async (p: Omit<Position, "id" | "time">) => {
      try {
        // todo - replace with API call
        setOpenPositions([
          ...openPositions,
          { ...p, id: new Date().toString(), time: new Date() },
        ]);

        return {
          success: true,
          data: {},
        };
      } catch (err) {
        return { success: false, error: "something went wrong." };
      }
    };

    const removePosition = async (id: string) => {
      try {
        // todo - replace with API call
        const positions = [...openPositions];

        const index = positions.findIndex((position) => position.id === id);
        if (index !== -1) {
          positions.splice(index, 1);
        }
        setOpenPositions(positions);

        return {
          success: true,
          data: {},
        };
      } catch (err) {
        return {
          success: false,
          error: "something went wrong.",
        };
      }
    };

    const updatePosition = async (id: string) => {
      try {
        // todo - replace with API call
        return {
          success: true,
          data: {},
        };
      } catch (err) {
        // return {
        //   success: false,
        //   error: "something went wrong.",
        // };
      }
    };

    const getGlobalCurrencyToken = (chainId: number) => {
      const tokens: { [name: string]: Token } = {
        usd: USDC[chainId],
        eth: WETH9[chainId],
      };
      return tokens[globalCurrency] || tokens["usd"];
    };

    return {
      filterClosed,
      setFilterClosed,
      globalCurrency,
      getGlobalCurrencyToken,
      setGlobalCurrency,
      theme,
      setTheme,
      openPositions,
      addPosition,
      removePosition,
      setShowPositionsModal,
      showPositionsModal,
    };
  }, [
    filterClosed,
    setFilterClosed,
    globalCurrency,
    setGlobalCurrency,
    theme,
    setTheme,
    openPositions,
    showPositionsModal,
  ]);

  return (
    <AppSettingsContext.Provider value={contextValue}>
      {children}
    </AppSettingsContext.Provider>
  );
};
