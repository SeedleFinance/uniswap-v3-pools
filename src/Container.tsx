import React, { useEffect, useState, useMemo } from "react";
import { ApolloProvider } from "@apollo/client/react";
import { useWeb3React } from "@web3-react/core";

import {
  mainnetClient,
  ropstenClient,
  arbitrumClient,
  optimismClient,
} from "./apollo/client";
import { AppSettingsProvider } from "./AppSettingsProvider";
import { PoolsProvider } from "./PoolsProvider";
import Account from "./Account";
import GlobalCurrencySelector from "./GlobalCurrencySelector";
import PageBody from "./PageBody";
import Footer from "./Footer";
import Landing from "./Landing";

import { useAddresses } from "./hooks/useAddresses";
import { injectedConnector, networkConnector } from "./utils/connectors";

function Container() {
  const { chainId, activate, active, account } = useWeb3React();
  const [injectFailed, setInjectFailed] = useState<boolean>(false);

  useEffect(() => {
    if (!active && !injectFailed) {
      activate(injectedConnector, (err) => {
        setInjectFailed(true);
      });
    }
  }, [activate, active, injectFailed]);

  useEffect(() => {
    if (!active && injectFailed) {
      activate(networkConnector, (err) => {
        console.error(err);
      });
    }
  }, [activate, active, injectFailed]);

  const addresses = useAddresses();

  const apolloClient = useMemo(() => {
    if (!chainId) {
      return mainnetClient;
    }

    if (chainId === 3) {
      return ropstenClient;
    } else if (chainId === 1) {
      return mainnetClient;
    } else if (chainId === 10) {
      return optimismClient;
    } else if (chainId === 42161) {
      // arbitrum-one
      return arbitrumClient;
    }

    return mainnetClient;
  }, [chainId]);

  if (!active || (injectFailed && !addresses.length)) {
    return <Landing />;
  }

  return (
    <AppSettingsProvider>
      <ApolloProvider client={apolloClient}>
        <PoolsProvider>
          <div className="lg:container mx-auto pb-4">
            <div className="w-full px-2 py-4 my-4 mb-4 flex justify-between">
              <h2 className="flex items-baseline text-3xl font-bold text-gray-600">
                <a className="flex" href="https://www.seedle.finance">
                  <img
                    className="mr-2"
                    alt="Seedle logo - a seedling"
                    src="/icon32.png"
                  />
                  <span>Seedle</span>
                </a>
              </h2>
              <div className="w-52 flex justify-between">
                <GlobalCurrencySelector />
                <Account address={account} />
              </div>
            </div>
            <div>
              <div>
                <PageBody />
              </div>
              <Footer />
            </div>
          </div>
        </PoolsProvider>
      </ApolloProvider>
    </AppSettingsProvider>
  );
}

export default Container;
