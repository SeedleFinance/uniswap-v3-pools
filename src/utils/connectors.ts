import { InjectedConnector } from "@web3-react/injected-connector";
import { NetworkConnector } from "@web3-react/network-connector";

const rpcUrl =
  "https://eth-mainnet.alchemyapi.io/v2/7O6zke8iSiT3vQ3v6AtHWjHwKfRGweLA";
export const injectedConnector = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 10, 42161],
});

const optiUrl =
  "https://opt-mainnet.g.alchemy.com/v2/ttmmWYRIVUD0PQdugBEx0DrlTEZWe875";

const arbUrl =
  "https://arb-mainnet.g.alchemy.com/v2/NWcnXFqOG71YPZkuE1irr-grCof6fKhF";

export const getNetworkConnector = () =>
  new NetworkConnector({
    urls: {
      1: rpcUrl,
      10: optiUrl,
      42161: arbUrl,
    },
    defaultChainId: 1,
  });
