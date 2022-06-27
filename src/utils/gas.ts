import { BigNumber } from '@ethersproject/bignumber';
import { CurrencyAmount } from '@uniswap/sdk-core';

import { ChainID } from '../enums';
import { WETH9, MATIC } from '../constants';

export function calcGasCost(chainId: ChainID, gasUsed: string, gasPrice: string) {
  const used = BigNumber.from(gasUsed);
  const price = BigNumber.from(gasPrice);
  const cost = used.mul(price);
  const costCurrency = CurrencyAmount.fromRawAmount(
    chainId === ChainID.Matic ? MATIC[chainId] : WETH9[chainId],
    cost.toString(),
  );

  return { used, price, cost, costCurrency };
}
