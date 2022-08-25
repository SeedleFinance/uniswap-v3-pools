import { useMemo } from 'react';
import { tickToPrice } from '@uniswap/v3-sdk';
import { Token, Ether, CurrencyAmount, Fraction } from '@uniswap/sdk-core';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';

import { WETH9, MATIC } from '../constants';
import { ChainID } from '../enums';
import { useAddress } from '../AddressProvider';
import { useFetchTokenBalances, TokenBalance } from './fetch';
import { formatInput } from '../utils/numbers';

function getTokenOrNative(chainId: number, address: string, metadata: any) {
  if (address === 'native') {
    if (chainId === ChainID.Matic) {
      return MATIC[chainId];
    }
    return new Ether(chainId);
  }
  return new Token(chainId, address, metadata.decimals, metadata.symbol, metadata.name);
}

function isNativeToken(chainId: number, token: Token | Ether) {
  return (
    token.isNative ||
    (chainId === ChainID.Matic ? token.equals(MATIC[chainId]) : token.equals(WETH9[chainId]))
  );
}

export function useTokensForNetwork(chainId: number) {
  const { addresses } = useAddress();
  const { loading, tokenBalances } = useFetchTokenBalances(chainId, addresses[0]);

  const tokens = useMemo(() => {
    if (!tokenBalances || !tokenBalances.length) {
      return [];
    }

    return tokenBalances.map(({ address, balance, metadata, priceTick }: TokenBalance) => {
      const token = getTokenOrNative(chainId, address, metadata);
      const balanceFormatted = formatInput(parseFloat(formatUnits(balance, token.decimals)));

      const ONE_UNIT = `1${'0'.repeat(token.decimals)}`;
      const tokenCurrency = CurrencyAmount.fromRawAmount(token, ONE_UNIT);

      const price = isNativeToken(chainId, token)
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
        address,
      };
    });
  }, [chainId, tokenBalances]);

  return { loading, tokens };
}
