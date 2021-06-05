import React, { useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";

import { PoolState, usePositionsByPools } from "./hooks/usePosition";

import Pool from "./Pool";
import Account from "./Account";

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
});

function Pools({ pools }: { pools: PoolState[] }) {
  if (!pools.length) {
    return (
      <div className="my-16 flex items-center justify-center">
        <div className="text-center text-2xl text-gray-400">
          Loading pools...
        </div>
      </div>
    );
  }
  return (
    <div>
      {pools.map((pool: PoolState) => (
        <Pool {...pool} />
      ))}
    </div>
  );
}

function Container() {
  const { activate, active, account } = useWeb3React();
  const pools = usePositionsByPools(account);

  useEffect(() => {
    activate(injected, (err) => console.error(err));
  }, [activate]);

  if (active) {
    return (
      <div className="lg:container mx-auto pb-4">
        <div className="w-full px-2 py-4 flex justify-end">
          <Account address={account} />
        </div>
        <div>
          <h2 className="text-5xl text-center font-bold text-red-600 m-5">
            Uniswap V3 Pools
          </h2>
          <div>
            <Pools pools={pools} />
          </div>
          <footer className="my-5 flex w-full justify-center">
            <div className="text-sm">
              Built by{" "}
              <a className="text-blue-500" href="https://twitter.com/laktek">
                @laktek
              </a>{" "}
              |{" "}
              <a
                className="text-blue-500"
                href="https://github.com/laktek/uniswap-v3-pools"
              >
                Source
              </a>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center text-4xl text-gray-800">
        Connect with Metamask to use the app.
      </div>
    </div>
  );
}

export default Container;
