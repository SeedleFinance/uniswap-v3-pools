import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 10, 42161, 137],
});

export const getNetworkConnector = () =>
  new NetworkConnector({
    urls: {
      1: 'https://eth-mainnet.alchemyapi.io/v2/saJ_d7L6OvoZ3t6jL7ewhv7ONWWi_J29',
      10: 'https://opt-mainnet.g.alchemy.com/v2/bEw3og1rC9BHAidSjH24d18OEPFnEyCC',
      42161: 'https://arb-mainnet.g.alchemy.com/v2/NWcnXFqOG71YPZkuE1irr-grCof6fKhF',
      137: 'https://polygon-mainnet.g.alchemy.com/v2/Fjjq6qMa4rJR-U4jk9KdyoAwY0pdR9KL',
    },
    defaultChainId: 1,
  });
