import { chain, configureChains, createClient } from 'wagmi';
import { connectorsForWallets, wallet } from '@rainbow-me/rainbowkit';

import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

export const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum],
  //@ts-ignore
  [
    jsonRpcProvider({
      rpc: (chain) => {
        const urls: { [index: number]: string } = {
          1: 'https://eth-mainnet.alchemyapi.io/v2/saJ_d7L6OvoZ3t6jL7ewhv7ONWWi_J29',
          10: 'https://opt-mainnet.g.alchemy.com/v2/bEw3og1rC9BHAidSjH24d18OEPFnEyCC',
          42161: 'https://arb-mainnet.g.alchemy.com/v2/cduelMqriBVheVg-8kGl_1ORm9NEK6ek',
          137: 'https://polygon-mainnet.g.alchemy.com/v2/Fjjq6qMa4rJR-U4jk9KdyoAwY0pdR9KL',
        };

        return {
          http: urls[chain.id],
        };
      },
    }),
    publicProvider(),
  ],
);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      wallet.metaMask({ chains }),
      wallet.ledger({ chains }),
      wallet.coinbase({ appName: 'Seedle Finance', chains }),
      wallet.rainbow({ chains }),
      wallet.walletConnect({ chains }),
    ],
  },
]);

export const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});
