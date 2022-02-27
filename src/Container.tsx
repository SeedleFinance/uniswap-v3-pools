import React, { ReactNode, useMemo } from "react";

import { useAddress } from "./AddressProvider";
import Account from "./Account";
import GlobalCurrencySelector from "./GlobalCurrencySelector";
import ThemeSelector from "./ThemeSelector";
import PageBody from "./PageBody";
import Footer from "./Footer";
import Landing from "./Landing";
import { useAppSettings } from "./AppSettingsProvider";
import { CurrencyConversionsProvider } from "./CurrencyConversionsProvider";

interface ThemeWrapperProps {
  theme: string;
  children: ReactNode;
}
function ThemeWrapper({ theme, children }: ThemeWrapperProps) {
  return (
    <div id="theme-wrapper" className={theme}>
      <div className="max-w-full bg-white dark:bg-slate-900">{children}</div>
    </div>
  );
}

function Container() {
  const { addresses, injectedAddress } = useAddress();
  const { theme } = useAppSettings();

  const computedTheme = useMemo(() => {
    if (
      theme === "dark" ||
      (theme === "" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      return "dark";
    } else {
      return "light";
    }
  }, [theme]);

  if (!addresses.length) {
    return (
      <ThemeWrapper theme={computedTheme}>
        <Landing />
      </ThemeWrapper>
    );
  }

  return (
    <CurrencyConversionsProvider>
      <ThemeWrapper theme={computedTheme}>
        <div className="min-h-screen lg:container mx-auto pb-4">
          <div className="w-full px-2 py-4 mb-4 flex justify-between">
            <h2 className="flex items-center text-3xl font-bold text-slate-800 dark:text-slate-100">
              <a className="flex w-3/5" href="https://www.seedle.finance">
                <img
                  className="mr-2"
                  alt="Seedle logo - a seedling"
                  src={new URL(
                    "../public/icon32.png",
                    import.meta.url
                  ).toString()}
                />
                <span>Seedle</span>
              </a>
            </h2>
            <div className="w-2/5 flex justify-end">
              <ThemeSelector />
              <GlobalCurrencySelector />
              <Account address={injectedAddress} />
            </div>
          </div>
          <div>
            <div>
              <PageBody />
            </div>
            <Footer />
          </div>
        </div>
      </ThemeWrapper>
    </CurrencyConversionsProvider>
  );
}

export default Container;
