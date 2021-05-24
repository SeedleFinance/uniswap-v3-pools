import React from "react";
import { Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "./apollo/client";

import Container from "./Container";

function getLibrary(provider: any) {
  return new Web3Provider(provider);
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ApolloProvider client={client}>
        <div className="App max-h-screen max-w-full">
          <Container />
        </div>
      </ApolloProvider>
    </Web3ReactProvider>
  );
}

export default App;
