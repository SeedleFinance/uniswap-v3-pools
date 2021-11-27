import JSBI from "jsbi";
import { Pool, Position } from "@uniswap/v3-sdk";
import { Token, CurrencyAmount, MaxUint256, WETH9 } from "@uniswap/sdk-core";

export function positionFromAmounts(
  {
    pool,
    tickLower,
    tickUpper,
    val0,
    val1,
  }: {
    pool: Pool;
    tickLower: number;
    tickUpper: number;
    val0: number;
    val1: number;
  },
  reverse: boolean
): Position {
  if (reverse) {
    [tickLower, tickUpper] = [tickUpper, tickLower];
    [val0, val1] = [val1, val0];
  }

  const amount0 =
    val0 === 0
      ? MaxUint256
      : JSBI.BigInt(Math.floor(val0 * Math.pow(10, pool.token0.decimals)));

  const amount1 =
    val1 === 0
      ? MaxUint256
      : JSBI.BigInt(Math.floor(val1 * Math.pow(10, pool.token1.decimals)));

  return Position.fromAmounts({
    pool,
    tickLower,
    tickUpper,
    amount0,
    amount1,
    useFullPrecision: false,
  });
}

export function calculateNewAmounts(
  {
    pool,
    tickLower,
    tickUpper,
    val0,
    val1,
  }: {
    pool: Pool;
    tickLower: number;
    tickUpper: number;
    val0: number;
    val1: number;
  },
  reverse: boolean
): [number, number] {
  const pos = positionFromAmounts(
    { pool, tickLower, tickUpper, val0, val1 },
    reverse
  );

  let newVal0 = parseFloat(pos.amount0.toSignificant(16));
  let newVal1 = parseFloat(pos.amount1.toSignificant(16));

  if (reverse) {
    [newVal0, newVal1] = [newVal1, newVal0];
  }

  return [newVal0, newVal1];
}

export function positionDistance(
  tickCurrent: number,
  position: { entity: Position }
): number {
  const { tickLower, tickUpper } = position.entity;
  if (tickLower <= tickCurrent && tickCurrent <= tickUpper) {
    //within range
    return Math.min(tickUpper - tickCurrent, tickCurrent - tickLower);
  } else if (tickCurrent > tickUpper) {
    // above range
    return tickCurrent - tickUpper;
  } else {
    // below range
    return tickLower - tickCurrent;
  }
}

export function tokenAmountNeedApproval(
  chainId: number,
  token: Token,
  allowance: number,
  amount: number
): boolean {
  if (!token || !chainId) {
    return false;
  }

  if (token.equals(WETH9[chainId])) {
    return false;
  }

  if (isNaN(allowance) || isNaN(amount)) {
    return false;
  }

  const allowanceRaw = Math.floor(allowance * Math.pow(10, token.decimals));
  const amountRaw = Math.ceil(amount * Math.pow(10, token.decimals));

  return CurrencyAmount.fromRawAmount(token, allowanceRaw).lessThan(
    CurrencyAmount.fromRawAmount(token, amountRaw)
  );
}

export interface TokenListItem {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

export async function loadTokens(chainId: number) {
  if (chainId === 3) {
    return [
      {
        address: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
        chainId: 3,
        name: "Wrapped Ether",
        symbol: "WETH",
        decimals: 18,
      },
      {
        address: "0xaD6D458402F60fD3Bd25163575031ACDce07538D",
        chainId: 3,
        name: "Dai Stablecoin",
        symbol: "DAI",
        decimals: 18,
      },
    ];
  }

  const tokenURLs: { [key: number]: string } = {
    1: "https://tokens.coingecko.com/uniswap/all.json",
    10: "https://static.optimism.io/optimism.tokenlist.json",
    42161: "https://bridge.arbitrum.io/token-list-42161.json",
  };

  const res = await fetch(tokenURLs[chainId]);
  if (!res.ok) {
    return [];
  }

  const json = await res.json();
  return json.tokens;
}

export function findTokens(
  chainId: number,
  tokens: TokenListItem[],
  symbols: string[]
) {
  const symbolsFormatted = symbols.map((symbol) => {
    const s = symbol.toUpperCase();
    if (s === "ETH") {
      return "WETH";
    }
    return s;
  });
  const matches = tokens.filter(
    (token: TokenListItem) =>
      token.chainId === chainId && symbolsFormatted.includes(token.symbol)
  );

  // Optimism WETH
  if (chainId === 10 && symbolsFormatted.includes("WETH")) {
    const weth = {
      address: "0x4200000000000000000000000000000000000006",
      chainId: 10,
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
    };
    matches.push(weth);
  }

  return matches;
}
