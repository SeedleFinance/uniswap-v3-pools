import React, { ReactNode, useContext, useCallback } from 'react';
import { Token, CurrencyAmount } from '@uniswap/sdk-core';
import { tickToPrice } from '@uniswap/v3-sdk';

import { WETH9, DAI, USDC, USDT, vUSD, MATIC, WBTC, CRV } from './constants';
import { formatCurrency } from './utils/numbers';
import { useAppSettings } from './AppSettingsProvider';

import { useFetchPriceFeed } from './hooks/fetch';

const CurrencyConversionsContext = React.createContext({
  convertToGlobal: (val: CurrencyAmount<Token>): number => {
    return 0;
  },
  convertToGlobalFormatted: (val: CurrencyAmount<Token>): string => {
    return '$0';
  },
  formatCurrencyWithSymbol: (val: number, chainId: number): string => {
    return '$0';
  },
});
export const useCurrencyConversions = () => useContext(CurrencyConversionsContext);

interface Props {
  children: ReactNode;
}

export const CurrencyConversionsProvider = ({ children }: Props) => {
  const { loading: loadingPriceFeed, priceFeed } = useFetchPriceFeed();
  const { getGlobalCurrencyToken } = useAppSettings();

  const getUSDPrice = useCallback(
    (tokenSymbol: string) => {
      if (loadingPriceFeed) {
        return 0;
      }

      const pricePools: { [sym: string]: any } = {
        WETH: {
          address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
          quoteToken: WETH9[1],
          baseToken: USDC[1],
        },
        DAI: {
          address: '0x5777d92f208679db4b9778590fa3cab3ac9e2168',
          quoteToken: DAI[1],
          baseToken: USDC[1],
        },
        USDT: {
          address: '0x3416cf6c708da44db2624d63ea0aaef7113527c6',
          quoteToken: USDT[1],
          baseToken: USDC[1],
        },
        WBTC: {
          address: '0x99ac8ca7087fa4a2a1fb6357269965a2014abc35',
          quoteToken: WBTC[1],
          baseToken: USDC[1],
        },
        MATIC: {
          address: '0x07a6e955ba4345bae83ac2a6faa771fddd8a2011',
          quoteToken: MATIC[1],
          baseToken: USDC[1],
        },
        CRV: {
          address: '0x9445bd19767f73dcae6f2de90e6cd31192f62589',
          quoteToken: CRV[1],
          baseToken: USDC[1],
        },
      };

      // pick a pool
      const pool = pricePools[tokenSymbol];
      if (!pool) {
        console.log('no matching price pool found for base token ', tokenSymbol);
        return 0;
      }

      const tick = priceFeed[pool.address];
      return parseFloat(tickToPrice(pool.quoteToken, pool.baseToken, tick).toSignificant(8));
    },
    [loadingPriceFeed, priceFeed],
  );

  const convertToGlobal = useCallback(
    (val: CurrencyAmount<Token>): number => {
      const valFloat = parseFloat(val.toSignificant(15));
      const globalCurrencyToken = getGlobalCurrencyToken(val.currency.chainId);
      if (val.currency.equals(globalCurrencyToken)) {
        return valFloat;
      }

      let price = 0;
      if (val.currency.equals(USDC[val.currency.chainId]) || val.currency.equals(vUSD)) {
        price = 1;
      } else {
        const curSymbol = val.currency.symbol === 'WMATIC' ? 'MATIC' : val.currency.symbol;
        price = getUSDPrice(curSymbol as string);
      }

      if (globalCurrencyToken.symbol === 'WETH') {
        const ethPrice = getUSDPrice('WETH');
        return valFloat * (price / ethPrice);
      }

      return price * valFloat;
    },
    [getGlobalCurrencyToken, getUSDPrice],
  );

  const formatCurrencyWithSymbol = useCallback(
    (val: number, chainId: number): string => {
      const currencySymbol = getGlobalCurrencyToken(chainId).equals(USDC[chainId]) ? '$' : 'Ξ';
      return formatCurrency(val, currencySymbol);
    },
    [getGlobalCurrencyToken],
  );

  const convertToGlobalFormatted = useCallback(
    (val: CurrencyAmount<Token>): string => {
      return formatCurrencyWithSymbol(convertToGlobal(val), val.currency.chainId);
    },
    [formatCurrencyWithSymbol, convertToGlobal],
  );

  return (
    <CurrencyConversionsContext.Provider
      value={{
        convertToGlobal,
        formatCurrencyWithSymbol,
        convertToGlobalFormatted,
      }}
    >
      {children}
    </CurrencyConversionsContext.Provider>
  );
};
