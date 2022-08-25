import React, { ReactNode, useContext, useCallback } from 'react';
import { Token, CurrencyAmount } from '@uniswap/sdk-core';
import { tickToPrice } from '@uniswap/v3-sdk';

import { WETH9, DAI, USDC, USDT, MATIC, WBTC, CRV, FEI } from './constants';
import { ChainID } from './enums';
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

const baseTokens: { [token: string]: Token } = {
  USDC: USDC[ChainID.Mainnet],
  DAI: DAI[ChainID.Mainnet],
  USDT: USDT[ChainID.Mainnet],
  WBTC: WBTC[ChainID.Mainnet],
  MATIC: MATIC[ChainID.Mainnet],
  CRV: CRV[ChainID.Mainnet],
  FEI: FEI,
};
const baseTokenAddresses = Object.values(baseTokens).map((t) => t.address);

export const CurrencyConversionsProvider = ({ children }: Props) => {
  const { loading: loadingPriceFeed, priceFeed } = useFetchPriceFeed(
    ChainID.Mainnet,
    baseTokenAddresses,
  );
  const { getGlobalCurrencyToken } = useAppSettings();

  const getETHPrice = useCallback(
    (token: Token) => {
      if (loadingPriceFeed) {
        return 0;
      }

      const tick = priceFeed[token.address];
      if (!tick) {
        console.log('no matching price pool found for base token ', token);
        return 0;
      }
      return parseFloat(tickToPrice(token, WETH9[ChainID.Mainnet], tick).toSignificant(8));
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
      if (val.currency.isNative || val.currency.equals(WETH9[val.currency.chainId])) {
        price = 1;
      } else {
        let currency = baseTokens[val.currency.symbol as string];
        if (val.currency.symbol === 'WMATIC' || val.currency.symbol === 'MATIC') {
          currency = MATIC[ChainID.Mainnet];
        } else if (val.currency.symbol === 'vUSD') {
          // treat Perp vUSD as USDC for pricing
          currency = USDC[ChainID.Mainnet];
        }

        if (!currency) {
          console.log('base token not found', val.currency);
          return 0;
        }
        price = getETHPrice(currency);
      }

      if (globalCurrencyToken.symbol === 'USDC') {
        const usdcPrice = getETHPrice(USDC[ChainID.Mainnet]);
        return valFloat * (price / usdcPrice);
      }

      return price * valFloat;
    },
    [getGlobalCurrencyToken, getETHPrice],
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
