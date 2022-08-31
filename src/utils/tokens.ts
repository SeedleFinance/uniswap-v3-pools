import { Token, Ether, Currency, CurrencyAmount } from '@uniswap/sdk-core';
import { tickToPrice } from '@uniswap/v3-sdk';

import { WETH9, DAI, USDC, USDT, PAX, FEI, WMATIC, WBTC, CRV } from '../constants';
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
    CRV[chainId],
    WBTC[chainId],
    WETH9[chainId],
    WMATIC[chainId],
  ];

  for (let i = 0; i < baseCurrencies.length; i++) {
    const cur = baseCurrencies[i];
    if (!cur) {
      continue;
    }
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

export function isNativeToken(token: Currency) {
  if (token.isNative) {
    return true;
  }
  return token.chainId === 137
    ? token.equals(WMATIC[token.chainId])
    : token.equals(WETH9[token.chainId]);
}

export function oneTokenUnit(token: Currency): string {
  return `1${'0'.repeat(token.decimals)}`;
}

export function priceFromTick(token: Currency, priceTick: number | null): CurrencyAmount<Currency> {
  const tokenCurrency = CurrencyAmount.fromRawAmount(token, oneTokenUnit(token));

  return isNativeToken(token)
    ? tokenCurrency
    : priceTick === null
    ? CurrencyAmount.fromRawAmount(WETH9[token.chainId], 0)
    : tickToPrice(token as Token, WETH9[token.chainId], priceTick).quote(
        tokenCurrency as CurrencyAmount<Token>,
      );
}
