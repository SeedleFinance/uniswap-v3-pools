import { BigNumber } from "@ethersproject/bignumber";
import { CurrencyAmount } from "@uniswap/sdk-core";

import { ChainID } from "../types/enums";
import { WETH9, MATIC } from "../common/constants";

export function calcGasCost(
  chainId: ChainID,
  gasUsed: string,
  gasPrice: string,
  l1Fee = "0"
) {
  const used = BigNumber.from(gasUsed);
  const price = BigNumber.from(gasPrice);
  const cost =
    chainId === ChainID.Optimism
      ? used.mul(price).add(BigNumber.from(l1Fee || "0"))
      : used.mul(price);
  const costCurrency = CurrencyAmount.fromRawAmount(
    chainId === ChainID.Matic ? MATIC[chainId] : WETH9[chainId],
    cost.toString()
  );

  return { used, price, cost, costCurrency };
}
