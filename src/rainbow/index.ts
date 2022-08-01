import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient } from 'wagmi';
import { connectorsForWallets, wallet } from '@rainbow-me/rainbowkit';

import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

export const { chains, provider } = configureChains(
  [chain.mainnet, chain.optimism, chain.arbitrum],
  //@ts-ignore
  [alchemyProvider({ alchemyId: process.env.ALCHEMY_ID }), publicProvider()],
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
