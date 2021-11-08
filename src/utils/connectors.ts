import { InjectedConnector } from "@web3-react/injected-connector";
import { NetworkConnector } from "@web3-react/network-connector";

const rpcUrl =
  "https://eth-mainnet.alchemyapi.io/v2/7O6zke8iSiT3vQ3v6AtHWjHwKfRGweLA";
export const injectedConnector = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
});

export const networkConnector = new NetworkConnector({
  urls: {
    1: rpcUrl,
  },
  defaultChainId: 1,
});
