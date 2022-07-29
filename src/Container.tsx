import React, { useMemo } from 'react';

import { useAddress } from './AddressProvider';
import { useAppSettings } from './AppSettingsProvider';
import GlobalCurrencySelector from './GlobalCurrencySelector';
import ThemeSelector from './ThemeSelector';
import PageBody from './PageBody';
import Footer from './Footer';

import { CurrencyConversionsProvider } from './CurrencyConversionsProvider';
import { EXTERNAL_LINKS, ROUTES } from './constants';
import Logo from './ui/Logo';
import Popover from './ui/Popover';
import Account from './Account';

function Container() {
  const { addresses } = useAddress();

  return (
    <CurrencyConversionsProvider>
      <div className="h-full lg:container mx-auto pb-4 p-4  flex flex-col items-stretch">
        <div className="w-full py-4 mb-1 md:mb-8 flex justify-between items-center">
          <a href={ROUTES.HOME}>
            <Logo />
          </a>
          <div className="md:w-2/5 flex justify-end">
            <ThemeSelector />
            {addresses.length > 0 && <GlobalCurrencySelector />}
            <div className="ml-2">
              <Account />
            </div>
          </div>
        </div>
        <div className="w-full h-full">
          <Popover
            title="Help Grow Seedle"
            description="Join over 2000+ contributers who have donated towards building Seedle."
            href={EXTERNAL_LINKS.GITCOIN}
          />
          <PageBody />
        </div>
        <Footer />
      </div>
    </CurrencyConversionsProvider>
  );
}

export default Container;
