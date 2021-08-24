import { WETH9, Token } from "@uniswap/sdk-core";

import { DAI, USDC, USDT, PAX, FEI } from "../constants";

export function getQuoteAndBaseToken(
  chainId: number | undefined,
  token0: Token,
  token1: Token
): [Token, Token] {
  let quote = token0;
  let base = token1;

  if (!chainId || !token0 || !token1) {
    return [quote, base];
  }

  const quoteCurrencies: Token[] = [USDC, USDT, DAI, FEI, PAX, WETH9[chainId]];

  quoteCurrencies.some((cur) => {
    if (token0.equals(cur)) {
      quote = token0;
      base = token1;
      return true;
    } else if (token1.equals(cur)) {
      quote = token1;
      base = token0;
      return true;
    }
    return false;
  });

  return [quote, base];
}
