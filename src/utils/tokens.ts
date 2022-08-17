import { Token, Ether } from '@uniswap/sdk-core';

import { WETH9, DAI, USDC, USDT, PAX, FEI, WMATIC, WBTC } from '../constants';
import MaticNativeCurrency from './matic';

export function getQuoteAndBaseToken(
  chainId: number | undefined,
  token0: Token,
  token1: Token,
): [Token, Token] {
  let quote = token0;
  let base = token1;

  if (!chainId || !token0 || !token1) {
    return [quote, base];
  }

  const baseCurrencies: Token[] = [
    USDC[chainId as number],
    USDT[chainId as number],
    DAI[chainId as number],
    FEI,
    PAX,
    WETH9[chainId],
    WBTC[chainId],
  ];

  for (let i = 0; i < baseCurrencies.length; i++) {
    const cur = baseCurrencies[i];
    if (token0.equals(cur)) {
      base = token0;
      quote = token1;
      break;
    } else if (token1.equals(cur)) {
      base = token1;
      quote = token0;
      break;
    }
  }

  return [quote, base];
}

export function getNativeToken(chainId: number) {
  return chainId === 137 ? new MaticNativeCurrency(chainId) : Ether.onChain(chainId);
}

export function isNativeToken(token: Token) {
  return token.chainId === 137
    ? token.equals(WMATIC[token.chainId])
    : token.equals(WETH9[token.chainId]);
}
