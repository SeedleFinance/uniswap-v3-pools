import { Token } from "@uniswap/sdk-core";

function constructSameAddressMap(
  address: string
): { [chainId in number]: string } {
  return {
    1: address,
    3: address,
    4: address,
    5: address,
    42: address,
  };
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = constructSameAddressMap(
  "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
);

export const DAI = new Token(
  1,
  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  18,
  "DAI",
  "Dai Stablecoin"
);
export const USDC = new Token(
  1,
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  6,
  "USDC",
  "USD//C"
);
export const USDT = new Token(
  1,
  "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  6,
  "USDT",
  "Tether USD"
);
export const FEI = new Token(
  1,
  "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",
  18,
  "FEI",
  "Fei USD"
);
export const LUSD = new Token(
  1,
  "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
  18,
  "LUSD",
  "LUSD Stablecoin"
);
export const PAX = new Token(
  1,
  "0x8e870d67f660d95d5be530380d0ec0bd388289e1",
  18,
  "PAX",
  "Paxos Standard"
);
