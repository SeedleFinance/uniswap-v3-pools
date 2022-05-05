import React, { ReactNode, useContext, useCallback } from 'react';
import { Token, CurrencyAmount } from '@uniswap/sdk-core';

import { useEthPrice } from './hooks/useEthPrice';
import { DAI, USDC, USDT, PAX, FEI, WETH9, vUSD, MATIC } from './constants';
import { formatCurrency } from './utils/numbers';
import { useAppSettings } from './AppSettingsProvider';

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
  const ethPriceUSD = useEthPrice();
  const { getGlobalCurrencyToken } = useAppSettings();

  const isStableCoin = (token: Token): boolean => {
    if (token.equals(DAI[token.chainId])) {
      return true;
    } else if (token.equals(USDC[token.chainId])) {
      return true;
    } else if (token.equals(USDT[token.chainId])) {
      return true;
    } else if (token.equals(PAX)) {
      return true;
    } else if (token.equals(FEI)) {
      return true;
    } else if (token.equals(vUSD)) {
      return true;
    }

    return false;
  };

  const convertToGlobal = useCallback(
    (val: CurrencyAmount<Token>): number => {
      const valFloat = parseFloat(val.toSignificant(15));
      const globalCurrencyToken = getGlobalCurrencyToken(val.currency.chainId);
      if (
        val.currency.equals(globalCurrencyToken) ||
        (globalCurrencyToken.equals(USDC[val.currency.chainId]) && isStableCoin(val.currency))
      ) {
        return valFloat;
      }

      if (val.currency.chainId === 137 && val.currency.equals(MATIC[val.currency.chainId])) {
        // FIXME: get dynamic MATIC value
        return valFloat * 2;
      }

      if (globalCurrencyToken.equals(WETH9[val.currency.chainId])) {
        return valFloat / ethPriceUSD;
      } else {
        return valFloat * ethPriceUSD;
      }
    },
    [getGlobalCurrencyToken, ethPriceUSD],
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
