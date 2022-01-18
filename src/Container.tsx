import React from "react";

import { AppSettingsProvider } from "./AppSettingsProvider";
import { useAddress } from "./AddressProvider";
import Account from "./Account";
import GlobalCurrencySelector from "./GlobalCurrencySelector";
import PageBody from "./PageBody";
import Footer from "./Footer";
import Landing from "./Landing";

function Container() {
  const { addresses, injectedAddress } = useAddress();

  if (!addresses.length) {
    return <Landing />;
  }

  return (
    <AppSettingsProvider>
      <div className="lg:container mx-auto pb-4">
        <div className="w-full px-2 py-4 my-4 mb-4 flex justify-between">
          <h2 className="flex items-baseline text-3xl font-bold text-gray-600">
            <a className="flex" href="https://www.seedle.finance">
              <img
                className="mr-2"
                alt="Seedle logo - a seedling"
                src={new URL("../public/icon32.png", import.meta.url)}
              />
              <span>Seedle</span>
            </a>
          </h2>
          <div className="w-72 flex justify-between">
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
    </AppSettingsProvider>
  );
}

export default Container;
