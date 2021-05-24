import { ChainId, Token } from "@uniswap/sdk-core";

function constructSameAddressMap(
  address: string
): { [chainId in ChainId]: string } {
  return {
    [ChainId.MAINNET]: address,
    [ChainId.ROPSTEN]: address,
    [ChainId.KOVAN]: address,
    [ChainId.RINKEBY]: address,
    [ChainId.GÖRLI]: address,
  };
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = constructSameAddressMap(
  "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
);

export const DAI = new Token(
  ChainId.MAINNET,
  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  18,
  "DAI",
  "Dai Stablecoin"
);
export const USDC = new Token(
  ChainId.MAINNET,
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  6,
  "USDC",
  "USD//C"
);
export const USDT = new Token(
  ChainId.MAINNET,
  "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  6,
  "USDT",
  "Tether USD"
);
export const FEI = new Token(
  ChainId.MAINNET,
  "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",
  18,
  "FEI",
  "Fei USD"
);
export const LUSD = new Token(
  ChainId.MAINNET,
  "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
  18,
  "LUSD",
  "LUSD Stablecoin"
);
