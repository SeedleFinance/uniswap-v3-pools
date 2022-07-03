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
import { Button } from './ui/Button';

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
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

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

  function handleToggleMenu() {
    setShowMobileMenu((prev) => !prev);
  }

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
        {showMobileMenu && (
          <div className="md:hidden w-4/5 bg-surface-0 fixed top-0 left-0 bottom-0 border-r border-element-10 p-10 z-50">
            <div className="text-high text-1.25 font-medium">Menu (WIP)</div>
            <ul>
              <li className="py-4">{theme}</li>
              <li className="py-4">
                <GlobalCurrencySelector />
              </li>
            </ul>
          </div>
        )}
        <div className="h-full lg:container mx-auto pb-4 p-4">
          <div className="w-full py-4 mb-8 flex justify-between items-center">
            <a href={ROUTES.HOME}>
              <Logo />
            </a>
            <div className="hidden md:w-2/5 md:flex justify-end">
              <ThemeSelector />
              <GlobalCurrencySelector />
              <Account address={injectedAddress} />
            </div>
            {/* Mobile Menu */}
            <div className="md:hidden flex items-center">
              <Button variant="ghost" onClick={handleToggleMenu}>
                <svg
                  className="w-6 h-6 text-gray-500"
                  x-show="!showMenu"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </Button>
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
