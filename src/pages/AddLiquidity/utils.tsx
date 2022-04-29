import JSBI from "jsbi";
import { BigNumber } from "@ethersproject/bignumber";
import { Pool, Position } from "@uniswap/v3-sdk";
import { Token, CurrencyAmount, MaxUint256 } from "@uniswap/sdk-core";

import { WETH9 } from "../../constants";
import { isNativeToken, getNativeToken } from "../../utils/tokens";

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

export function toCurrencyAmount(
  token: Token,
  amount: number,
  wrapped: boolean = false
) {
  const bigIntish =
    amount > 0
      ? JSBI.BigInt(Math.floor(amount * Math.pow(10, token.decimals)))
      : 0;
  // convert the token to native ether if it's WETH
  const native =
    isNativeToken(token) && !wrapped ? getNativeToken(token.chainId) : token;

  return CurrencyAmount.fromRawAmount(native, bigIntish);
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
  amount: number,
  wrapped: boolean = false
): boolean {
  if (!token || !chainId) {
    return false;
  }

  if (token.equals(WETH9[chainId]) && !wrapped && token.chainId !== 137) {
    return false;
  }

  if (isNaN(allowance) || isNaN(amount)) {
    return false;
  }

  const allowanceRaw = Math.floor(allowance * Math.pow(10, token.decimals));
  const amountRaw = Math.ceil(amount * Math.pow(10, token.decimals));

  const res = CurrencyAmount.fromRawAmount(token, allowanceRaw).lessThan(
    CurrencyAmount.fromRawAmount(token, amountRaw)
  );

  return res;
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
    137: "https://api-polygon-tokens.polygon.technology/tokenlists/allTokens.tokenlist.json",
  };

  const res = await fetch(tokenURLs[chainId]);
  if (!res.ok) {
    return [];
  }

  const json = await res.json();
  const { tokens } = json;

  // add WMATIC
  if (chainId === 137) {
    tokens.push({
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      chainId: 137,
      name: "Wrapped Matic Token",
      symbol: "WMATIC",
      decimals: 18,
    });
  }
  return tokens;
}

export function findTokens(
  chainId: number,
  tokens: TokenListItem[],
  symbols: string[]
) {
  const symbolsFormatted = symbols.map((sym) => {
    const s = sym.toUpperCase();
    if (s === "ETH") {
      return "WETH";
    }
    // in Polygon, return ETH instead of WETH to match
    if (chainId === 137 && s === "WETH") {
      return "ETH";
    }
    return s;
  });

  let matches: TokenListItem[] = [];
  symbolsFormatted.forEach((sym) => {
    const matched = tokens.find((token: TokenListItem) => {
      return token.chainId === chainId && token.symbol === sym;
    });
    if (matched) {
      matches.push(matched);
    }
  });

  return matches;
}

export function findMatchingPosition(
  positions: any[] | null,
  fee: number,
  tickLower: number,
  tickUpper: number
) {
  if (!positions || !positions.length) {
    return null;
  }

  return positions.find((position) => {
    const { entity } = position;
    if (
      entity.pool.fee === fee &&
      entity.tickLower === tickLower &&
      entity.tickUpper === tickUpper
    ) {
      return true;
    }
    return false;
  });
}

export function getApprovalAmount(val1: number, val2: number) {
  return Math.max(val1, val2);
}

export function findPositionById(positions: any[], id: string | null) {
  if (!id || id === "") {
    return null;
  }

  return positions.find((pos) => pos.id.eq(BigNumber.from(id)));
}
