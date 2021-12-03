import React, { ReactNode } from "react";
import { createWeb3ReactRoot } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

function getLibrary(provider: any) {
  return new Web3Provider(provider);
}
const MainnetProvider = createWeb3ReactRoot("mainnet");
const OptimismProvider = createWeb3ReactRoot("optimism");
const ArbitrumProvider = createWeb3ReactRoot("arbitrum");
const InjectWalletProvider = createWeb3ReactRoot("injected");

interface Props {
  children: ReactNode;
}

function Provider({ children }: Props) {
  return (
    <MainnetProvider getLibrary={getLibrary}>
      <OptimismProvider getLibrary={getLibrary}>
        <ArbitrumProvider getLibrary={getLibrary}>
          <InjectWalletProvider getLibrary={getLibrary}>
            {children}
          </InjectWalletProvider>
        </ArbitrumProvider>
      </OptimismProvider>
    </MainnetProvider>
  );
}

export default Provider;
