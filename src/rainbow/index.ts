import { chain, configureChains, createClient } from 'wagmi';
import { connectorsForWallets, wallet } from '@rainbow-me/rainbowkit';

import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

export const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum],
  //@ts-ignore
  [
    alchemyProvider({ apiKey: 'saJ_d7L6OvoZ3t6jL7ewhv7ONWWi_J29', priority: 0 }),
    publicProvider({ priority: 1 }),
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
