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
          <div className="App max-h-screen max-w-full">
            <Container />
          </div>
        </AddressProvider>
      </SubgraphProvider>
    </Web3CombinedProvider>
  );
}

export default App;
