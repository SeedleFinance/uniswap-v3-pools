import React, { ReactNode, useMemo } from 'react';

import { useAddress } from './AddressProvider';
import Account from './Account';
import GlobalCurrencySelector from './GlobalCurrencySelector';
import ThemeSelector from './ThemeSelector';
import PageBody from './PageBody';
import Footer from './Footer';
import Landing from './pages/Landing';
import { useAppSettings } from './AppSettingsProvider';
import { CurrencyConversionsProvider } from './CurrencyConversionsProvider';
import { ROUTES } from './constants';
import Logo from './ui/Logo';
import classNames from 'classnames';

interface ThemeWrapperProps {
  theme: 'light' | 'dark';
  children: ReactNode;
}
function ThemeWrapper({ theme, children }: ThemeWrapperProps) {
  return (
    <div id="theme-wrapper" className={classNames(theme, 'h-full')}>
      <div className="max-w-full bg-canvas-light h-full">{children}</div>
    </div>
  );
}

function Container() {
  const { addresses, injectedAddress } = useAddress();
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
        <div className="h-full lg:container mx-auto pb-4 p-4">
          <div className="w-full py-4 mb-8 flex justify-between items-center">
            <a href={ROUTES.HOME}>
              <Logo />
            </a>
            <div className="md:w-2/5 flex justify-end">
              <ThemeSelector />
              <GlobalCurrencySelector />
              <Account address={injectedAddress} />
            </div>
          </div>
          <PageBody />
          <div>
            <Footer />
          </div>
        </div>
      </ThemeWrapper>
    </CurrencyConversionsProvider>
  );
}

export default Container;
