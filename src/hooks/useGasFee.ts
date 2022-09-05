import { useMemo } from "react";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";

import { WETH9 } from "../common/constants";
import { useEthPrice } from "./useEthPrice";

export function useGasFee(baseToken: Token) {
  const weth = WETH9[baseToken.chainId];
  const ethPriceUSD = useEthPrice();

  return useMemo(() => {
    return (val: CurrencyAmount<Token>) => {
      // FIXME: dynamically fetch MATIC price
      if (val.currency.chainId === 137) {
        return CurrencyAmount.fromRawAmount(
          baseToken,
          Math.round(
            2 *
              parseFloat(val.toSignificant(8)) *
              Math.pow(10, baseToken.decimals)
          )
        );
      }

      if (baseToken.equals(weth)) {
        return val;
      }

      return CurrencyAmount.fromRawAmount(
        baseToken,
        Math.round(
          ethPriceUSD *
            parseFloat(val.toSignificant(8)) *
            Math.pow(10, baseToken.decimals)
        )
      );
    };
  }, [baseToken, weth, ethPriceUSD]);
}
