import React from "react";

import Web3CombinedProvider from "./Web3CombinedProvider";
import SubgraphProvider from "./SubgraphProvider";
import { AddressProvider } from "./AddressProvider";
import Container from "./Container";

function App() {
  return (
    <Web3CombinedProvider>
      <SubgraphProvider>
        <AddressProvider>
          <div className="App max-w-full bg-white dark:bg-slate-900">
            <Container />
          </div>
        </AddressProvider>
      </SubgraphProvider>
    </Web3CombinedProvider>
  );
}

export default App;
