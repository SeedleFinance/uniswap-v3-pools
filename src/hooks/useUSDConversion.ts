import { useMemo } from "react";
import { WETH9, CurrencyAmount, Token } from "@uniswap/sdk-core";

import { usePool } from "./usePool";
import { useChainId } from "./useChainId";
import { USDC, DAI, USDT, LUSD } from "../constants";

export function useUSDConversion(baseToken: Token | null) {
  let fee = 0.3;
  const chainId = useChainId();
  if (baseToken === null) {
    fee = 0;
  } else if (baseToken.equals(DAI[chainId as number])) {
    fee = 0.05;
  } else if (baseToken.equals(USDT[chainId as number])) {
    fee = 0.05;
  } else if (baseToken.equals(LUSD)) {
    fee = 0.05;
  }

  const usdc = USDC[chainId as number];
  const { pool } = usePool(baseToken, usdc, fee * 10000);

  return useMemo(() => {
    const ratio =
      pool && baseToken
        ? parseFloat(pool.priceOf(baseToken).toSignificant(2)) * 100
        : 0;
    return (val: CurrencyAmount<Token> | number) => {
      if (val === 0 || !baseToken) {
        return 0.0;
      }

      if (baseToken.equals(usdc)) {
        return parseFloat((val as CurrencyAmount<Token>).toSignificant(15));
      }

      return parseFloat(
        (val as CurrencyAmount<Token>)
          .multiply(ratio)
          .divide(100)
          .toSignificant(15)
      );
    };
  }, [baseToken, pool, usdc]);
}

export function useEthToQuote(baseToken: Token) {
  let fee = 0.3;
  const chainId = useChainId();
  const weth = WETH9[chainId as number];
  const { pool } = usePool(baseToken, weth, fee * 10000);

  return useMemo(() => {
    return (val: CurrencyAmount<Token>) => {
      if (baseToken.equals(weth)) {
        return val;
      }

      if (!pool) {
        return CurrencyAmount.fromRawAmount(baseToken, 0);
      }

      return pool.priceOf(weth).quote(val);
    };
  }, [baseToken, pool, weth]);
}
