import { useMemo } from 'react';
import { tickToPrice } from '@uniswap/v3-sdk';
import { Token, CurrencyAmount, Fraction } from '@uniswap/sdk-core';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

import { WETH9 } from '../constants';
import { useAddress } from '../AddressProvider';
import { useFetchTokenBalances, TokenBalance } from './fetch';
import { formatInput } from '../utils/numbers';

export function useTokens(chainId: number) {
  const { addresses } = useAddress();
  const { loading, tokenBalances } = useFetchTokenBalances(chainId, addresses[0]);

  const tokens = useMemo(() => {
    if (!tokenBalances || !tokenBalances.length) {
      return [];
    }

    return tokenBalances
      .map(({ address, balance, metadata, priceTick }: TokenBalance) => {
        const token = new Token(
          chainId,
          address,
          metadata.decimals,
          metadata.symbol,
          metadata.name,
        );
        const balanceFormatted = formatInput(parseFloat(formatUnits(balance, token.decimals)));

        const ONE_UNIT = `1${'0'.repeat(token.decimals)}`;
        const tokenCurrency = CurrencyAmount.fromRawAmount(token, ONE_UNIT);
        const price = token.equals(WETH9[chainId])
          ? tokenCurrency
          : priceTick === null
          ? CurrencyAmount.fromRawAmount(WETH9[chainId], 0)
          : tickToPrice(token, WETH9[chainId], priceTick).quote(tokenCurrency);
        const value = price.multiply(new Fraction(BigNumber.from(balance).toString(), ONE_UNIT));

        return {
          chainId,
          entity: token,
          balance: balanceFormatted,
          price: price,
          value: value,
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
          logo: metadata.logo,
        };
      })
      .sort((a, b) => (a.value.lessThan(b.value) ? 1 : -1));
  }, [chainId, tokenBalances]);

  return { loading, tokens };
}
