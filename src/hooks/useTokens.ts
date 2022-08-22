import { useState, useEffect } from 'react';
import { Network as AlchemyNetwork, Network } from 'alchemy-sdk';
import { useAddress } from '../AddressProvider';
import { getAlchemy } from '../alchemy';
import { useNetwork } from 'wagmi';

interface AlchemyToken {
  name: string;
  balance: number;
  price: number;
  network: string;
  logo: string;
}

const mapNetworkToAlchemyNetwork: { [key: string]: AlchemyNetwork } = {
  Ethereum: Network.ETH_MAINNET,
  Optimism: Network.OPT_MAINNET,
  Arbitrum: Network.ARB_MAINNET,
  Polygon: Network.MATIC_MAINNET,
};

const mapNetworkToLabel: { [key: string]: string } = {
  Ethereum: 'Mainnet',
  Mainnet: 'Mainnet',
  Optimism: 'Optimism',
  Arbitrum: 'Arbitrum',
  Polygon: 'Polygon',
};

async function fetchTokens(addresses: string[], network: string) {
  if (!addresses.length) return [];

  // instantiate alchemy with network
  const alchemy = getAlchemy(mapNetworkToAlchemyNetwork[network]);

  const data = await alchemy.core.getTokenBalances(addresses[0]); // - for now
  console.log('Response Object for getTokenBalances\n', data);

  const tokens: AlchemyToken[] = [];
  const tokenBalances = Array.from(data.tokenBalances.values());

  await Promise.all(
    tokenBalances.map(async (token: any) => {
      /*
       ** Fetching the metadata for the token with Alchemy's getTokenMetadata API
       */
      const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);

      // Forming the name of the token that comprises of the Name and the Symbol of the token
      const tokenName = metadata.name + '(' + metadata.symbol + ')';

      /* Calculating the tokenBalance in decimal. The "decimals" field in the token metadata tells us
      how many digits at the end of the tokenBalance in Line 17 are to the right of the decimal.
      so we divide the Full tokenBalance with 10 to the power of the decimal value of the token
      */
      const balance = (token.tokenBalance as any) / Math.pow(10, metadata.decimals!);

      // placeholder for the price of the token
      const price = 0.0;

      // Only show tokens with a balance > 0
      if (balance > 0) {
        console.log('Token balance for', tokenName, 'is', balance);
        tokens.push({
          name: tokenName,
          balance: balance,
          logo: metadata.logo!,
          network: mapNetworkToLabel[network],
          price,
        });
      }
    }),
  );

  return tokens;
}

interface TokenState {
  loading: boolean;
  data?: AlchemyToken[];
  error?: Error;
}

export function useTokens() {
  const { addresses } = useAddress();
  const [state, setState] = useState<TokenState>({
    loading: true,
  });
  const { chain } = useNetwork();

  useEffect(() => {
    let mounted = true;

    const activeNetwork = chain?.name || 'Mainnet';

    (async () => {
      try {
        const tokens = await fetchTokens(addresses, activeNetwork);

        if (mounted) {
          setState({
            data: tokens,
            loading: false,
          });
        }
      } catch (err) {
        if (mounted) {
          setState({ error: err as Error, loading: false });
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [addresses, chain?.name]);

  return state;
}
