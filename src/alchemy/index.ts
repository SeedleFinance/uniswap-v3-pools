import { Alchemy, Network } from 'alchemy-sdk';

export function getAlchemy(network: Network): Alchemy {
  return new Alchemy({
    apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
    network,
  });
}
