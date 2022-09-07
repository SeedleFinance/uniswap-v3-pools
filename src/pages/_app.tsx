import React, { ReactNode, useMemo } from 'react';
import { WagmiConfig } from 'wagmi';
import type { AppProps } from 'next/app';
import classNames from 'classnames';

import '../styles/globals.css';

import SubgraphProvider from '../providers/SubgraphProvider';
import { AddressProvider, useAddress } from '../providers/AddressProvider';
import RainbowKitWithThemeProvider from '../providers/RainbowKitWithThemeProvider';
import { CurrencyConversionsProvider } from '../providers/CurrencyConversionProvider';
import { CombinedPoolsProvider } from '../providers/CombinedPoolsProvider';
import { CombinedTokensProvider } from '../providers/CombinedTokensProvider';
import AppSettingsProviderWithWrapper, { useAppSettings } from '../providers/AppSettingsProvider';

import PageContainer from '../components/PageContainer';
import Landing from '../layouts/LandingLayout';
import { wagmiClient } from '../lib/rainbow';

function ThemeWrapper({ children }: { children: ReactNode }) {
  const { theme } = useAppSettings();

  return (
    <div id="theme-wrapper" className={classNames(theme, 'h-full')}>
      <div className="max-w-full bg-canvas-light h-full">{children}</div>
    </div>
  );
}

function PoolsAndTokensCombinedProviders({ children }: { children: React.ReactNode }) {
  return (
    <CombinedPoolsProvider>
      <CombinedTokensProvider>{children}</CombinedTokensProvider>
    </CombinedPoolsProvider>
  );
}

// This component checks if there are any connected addresses
// and if there are NOT we show the landing page.
function CheckForActiveAddress({ children }: { children: React.ReactNode }) {
  const { addressReady } = useAddress();

  return (
    <PageContainer>
      {addressReady ? (
        <PoolsAndTokensCombinedProviders>{children}</PoolsAndTokensCombinedProviders>
      ) : (
        <Landing />
      )}
    </PageContainer>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  const CombinedProviders = useMemo(() => {
    return (
      <SubgraphProvider>
        <WagmiConfig client={wagmiClient}>
          <AddressProvider>
            <AppSettingsProviderWithWrapper>
              <ThemeWrapper>
                <RainbowKitWithThemeProvider>
                  <CurrencyConversionsProvider>
                    <CheckForActiveAddress>
                      <Component {...pageProps} />
                    </CheckForActiveAddress>
                  </CurrencyConversionsProvider>
                </RainbowKitWithThemeProvider>
              </ThemeWrapper>
            </AppSettingsProviderWithWrapper>
          </AddressProvider>
        </WagmiConfig>
      </SubgraphProvider>
    );
  }, [Component, pageProps]);

  return CombinedProviders;
}

export default MyApp;
