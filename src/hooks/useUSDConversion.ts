import { useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import { WETH9, ChainId, CurrencyAmount, Token } from "@uniswap/sdk-core";

import { usePool } from "./usePool";
import { USDC, DAI, USDT, LUSD } from "../constants";

export function useUSDConversion(quoteToken: Token) {
  let fee = 0.3;
  if (quoteToken.equals(DAI)) {
    fee = 0.05;
  } else if (quoteToken.equals(USDT)) {
    fee = 0.05;
  } else if (quoteToken.equals(LUSD)) {
    fee = 0.05;
  }

  const { pool } = usePool(quoteToken, USDC, fee * 10000);

  return useMemo(() => {
    const ratio = pool
      ? parseFloat(pool.priceOf(quoteToken).toSignificant(2)) * 100
      : 0;
    return (val: CurrencyAmount<Token> | number) => {
      if (val === 0) {
        return "0.00";
      }

      if (quoteToken.equals(USDC)) {
        return parseFloat(
          (val as CurrencyAmount<Token>).toSignificant(15)
        ).toFixed(2);
      }

      return parseFloat(
        (val as CurrencyAmount<Token>)
          .multiply(ratio)
          .divide(100)
          .toSignificant(15)
      ).toFixed(2);
    };
  }, [quoteToken, pool]);
}

export function useEthToQuote(quoteToken: Token) {
  let fee = 0.3;
  const { chainId } = useWeb3React();
  const weth = WETH9[chainId as ChainId];
  const { pool } = usePool(quoteToken, weth, fee * 10000);

  return useMemo(() => {
    return (val: CurrencyAmount<Token>) => {
      if (quoteToken.equals(weth)) {
        return val;
      }

      if (!pool) {
        return CurrencyAmount.fromRawAmount(quoteToken, 0);
      }

      return pool.priceOf(weth).quote(val);
    };
  }, [quoteToken, pool, weth]);
}
