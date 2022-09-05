import React, { ReactNode, useMemo } from "react";
import {
  darkTheme,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { useAppSettings } from "./AppSettingsProvider";
import { chains } from "../lib/rainbow";

function RainbowKitWithThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useAppSettings();

  const computedTheme = useMemo(() => {
    if (theme === "dark") {
      return darkTheme({
        accentColor: "#4cce57",
        borderRadius: "small",
        fontStack: "system",
      });
    } else {
      return lightTheme({
        accentColor: "#4cce57",
        borderRadius: "small",
        fontStack: "system",
      });
    }
  }, [theme]);

  return (
    <RainbowKitProvider chains={chains} theme={computedTheme}>
      {children}
    </RainbowKitProvider>
  );
}

export default RainbowKitWithThemeProvider;
