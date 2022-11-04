import { TokenData } from './hooks/useToken';

export const tokenData: { [key: string]: TokenData } = {
  '0x2170ed0880ac9a755fd29b2688956bd959f933f8': {
    name: 'Ethereum',
    symbol: 'ETH',
    balancePerNetwork: {
      mainnet: 1.5,
      arbritrum: 3,
      polygon: 2,
    },
    price: 1500, //mainnet
    marketCap: 1500000000,
    supply: 1000000,
    swapVol: 1000000,
    allHigh: 5000,
    allLow: 600,
    historical: [],
    transactions: [],
  },
  '0x6B175474E89094C44Da98b954EedeAC495271d0F': {
    name: 'Dai',
    symbol: 'DAI',
    balancePerNetwork: {
      mainnet: 1.5,
      arbritrum: 3,
      polygon: 2,
    },
    price: 0.999, //mainnet
    marketCap: 1500000000,
    supply: 1000000,
    swapVol: 1000000,
    allHigh: 5000,
    allLow: 600,
    historical: [],
    transactions: [],
  },
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': {
    name: 'USD Coin',
    symbol: 'USD',
    balancePerNetwork: {
      mainnet: 1.5,
      arbritrum: 3,
      polygon: 2,
    },
    price: 1.0, //mainnet
    marketCap: 1500000000,
    supply: 1000000,
    swapVol: 1000000,
    allHigh: 5000,
    allLow: 600,
    historical: [],
    transactions: [],
  },
};
