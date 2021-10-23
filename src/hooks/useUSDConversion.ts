import { useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import { WETH9, CurrencyAmount, Token } from "@uniswap/sdk-core";

import { usePool } from "./usePool";
import { USDC, DAI, USDT, LUSD } from "../constants";

export function useUSDConversion(baseToken: Token | null) {
  let fee = 0.3;
  if (baseToken === null) {
    fee = 0;
  } else if (baseToken.equals(DAI)) {
    fee = 0.05;
  } else if (baseToken.equals(USDT)) {
    fee = 0.05;
  } else if (baseToken.equals(LUSD)) {
    fee = 0.05;
  }

  const { pool } = usePool(baseToken, USDC, fee * 10000);

  return useMemo(() => {
    const ratio =
      pool && baseToken
        ? parseFloat(pool.priceOf(baseToken).toSignificant(2)) * 100
        : 0;
    return (val: CurrencyAmount<Token> | number) => {
      if (val === 0 || !baseToken) {
        return 0.0;
      }

      if (baseToken.equals(USDC)) {
        return parseFloat((val as CurrencyAmount<Token>).toSignificant(15));
      }

      return parseFloat(
        (val as CurrencyAmount<Token>)
          .multiply(ratio)
          .divide(100)
          .toSignificant(15)
      );
    };
  }, [baseToken, pool]);
}

export function useEthToQuote(baseToken: Token) {
  let fee = 0.3;
  const { chainId } = useWeb3React();
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
