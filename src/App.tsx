import React from "react";

import Web3CombinedProvider from "./Web3CombinedProvider";
import SubgraphProvider from "./SubgraphProvider";
import Container from "./Container";

function App() {
  return (
    <Web3CombinedProvider>
      <SubgraphProvider>
        <div className="App max-h-screen max-w-full">
          <Container />
        </div>
      </SubgraphProvider>
    </Web3CombinedProvider>
  );
}

export default App;
