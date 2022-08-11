import React, { ReactNode, useMemo } from 'react';

import Web3CombinedProvider from './Web3CombinedProvider';
import SubgraphProvider from './SubgraphProvider';
import { AddressProvider } from './AddressProvider';
import { AppSettingsProvider, useAppSettings } from './AppSettingsProvider';
import Container from './Container';
import { RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';

import classNames from 'classnames';
import { chains, wagmiClient } from './rainbow';

function ThemeWrapper({ children }: { children: ReactNode }) {
  const { theme } = useAppSettings();

  return (
    <div id="theme-wrapper" className={classNames(theme, 'h-full')}>
      <div className="max-w-full bg-canvas-light h-full">{children}</div>
    </div>
  );
}

function RainbowKitWithTheme({ children }: { children: ReactNode }) {
  const { theme } = useAppSettings();

  const computedTheme = useMemo(() => {
    if (theme === 'dark') {
      return darkTheme({
        accentColor: '#4cce57',
        borderRadius: 'small',
        fontStack: 'system',
      });
    } else {
      return lightTheme({
        accentColor: '#4cce57',
        borderRadius: 'small',
        fontStack: 'system',
      });
    }
  }, [theme]);

  return (
    <RainbowKitProvider chains={chains} theme={computedTheme}>
      {children}
    </RainbowKitProvider>
  );
}

function App() {
  return (
    <Web3CombinedProvider>
      <SubgraphProvider>
        <WagmiConfig client={wagmiClient}>
          <AddressProvider>
            <AppSettingsProvider>
              <ThemeWrapper>
                <RainbowKitWithTheme>
                  <Container />
                </RainbowKitWithTheme>
              </ThemeWrapper>
            </AppSettingsProvider>
          </AddressProvider>
        </WagmiConfig>
      </SubgraphProvider>
    </Web3CombinedProvider>
  );
}

export default App;
