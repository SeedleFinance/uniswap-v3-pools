import React, { ReactNode, useMemo } from 'react';
import '@rainbow-me/rainbowkit/dist/index.css';

import Web3CombinedProvider from './Web3CombinedProvider';
import SubgraphProvider from './SubgraphProvider';
import { AddressProvider } from './AddressProvider';
import { AppSettingsProvider, useAppSettings } from './AppSettingsProvider';
import Container from './Container';
import { RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';

import classNames from 'classnames';
import { chains, wagmiClient } from './rainbow';

interface ThemeWrapperProps {
  children: ReactNode;
}
function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { theme } = useAppSettings();

  const computedTheme = useMemo(() => {
    if (
      theme === 'dark' ||
      (theme === '' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      return 'dark';
    } else {
      return 'light';
    }
  }, [theme]);
  return (
    <div id="theme-wrapper" className={classNames(computedTheme, 'h-full')}>
      <div className="max-w-full bg-canvas-light h-full">{children}</div>
    </div>
  );
}

function App() {
  return (
    <Web3CombinedProvider>
      <SubgraphProvider>
        <AddressProvider>
          <AppSettingsProvider>
            <ThemeWrapper>
              <WagmiConfig client={wagmiClient}>
                <RainbowKitProvider
                  chains={chains}
                  theme={lightTheme({
                    accentColor: '#4cce57',
                    borderRadius: 'small',
                    fontStack: 'system',
                  })}
                >
                  <Container />
                </RainbowKitProvider>
              </WagmiConfig>
            </ThemeWrapper>
          </AppSettingsProvider>
        </AddressProvider>
      </SubgraphProvider>
    </Web3CombinedProvider>
  );
}

export default App;
