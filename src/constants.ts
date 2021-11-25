import { Token, Percent } from "@uniswap/sdk-core";
import { BigNumber } from "@ethersproject/bignumber";

function constructSameAddressMap(
  address: string
): { [chainId in number]: string } {
  return {
    1: address,
    3: address,
    4: address,
    5: address,
    42: address,
    10: address,
    42161: address,
  };
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = constructSameAddressMap(
  "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
);

export const DAI: { [key: number]: Token } = {
  1: new Token(
    1,
    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    18,
    "DAI",
    "Dai Stablecoin"
  ),
  10: new Token(
    10,
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    18,
    "DAI",
    "Dai Stablecoin"
  ),
  42161: new Token(
    42161,
    "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    18,
    "DAI",
    "Dai Stablecoin"
  ),
};

export const USDC: { [key: number]: Token } = {
  1: new Token(
    1,
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    6,
    "USDC",
    "USD//C"
  ),

  10: new Token(
    10,
    "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    6,
    "USDC",
    "USD//C"
  ),
  42161: new Token(
    42161,
    "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    6,
    "USDC",
    "USD Coin (Arb1)"
  ),
};

export const USDT: { [key: number]: Token } = {
  1: new Token(
    1,
    "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    6,
    "USDT",
    "Tether USD"
  ),
  10: new Token(
    10,
    "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    6,
    "USDT",
    "Tether USD"
  ),
  42161: new Token(
    42161,
    "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    6,
    "USDT",
    "Tether USD"
  ),
};

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

export const DEFAULT_SLIPPAGE = new Percent(50, 10_000);
export const ZERO_PERCENT = new Percent("0");
export const Q128 = BigNumber.from(2).pow(128);

export const BLOCK_EXPLORER_URL: { [key: number]: string } = {
  1: "https://etherscan.io/tx/",
  10: "https://optimistic.etherscan.io/tx/",
  42161: "https://arbiscan.io/tx/",
};
