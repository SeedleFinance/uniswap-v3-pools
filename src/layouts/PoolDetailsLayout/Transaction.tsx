import React, { useMemo } from "react";
import { Token, CurrencyAmount } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";
import format from "date-fns/format";

import { useCurrencyConversions } from "../../providers/CurrencyConversionProvider";
import TokenSymbol from "../../components/TokenLabel";
import { TxTypes } from "../../types/enums";

import { BLOCK_EXPLORER_URL } from "../../common/constants";
import IconNewWindow from "../../components/icons/NewWindow";

export interface TransactionProps {
  id: string;
  transactionHash: string;
  pool: Pool;
  baseToken: Token;
  timestamp: number;
  transactionType: TxTypes;
  amount0: CurrencyAmount<Token>;
  amount1: CurrencyAmount<Token>;
  gas: { costCurrency: CurrencyAmount<Token> };
}

function Transaction({
  id,
  transactionHash,
  pool,
  baseToken,
  timestamp,
  transactionType,
  amount0,
  amount1,
  gas,
}: TransactionProps) {
  const { convertToGlobalFormatted, formatCurrencyWithSymbol } =
    useCurrencyConversions();
  const totalLiquidity = useMemo(() => {
    if (!baseToken || !pool) {
      return 0;
    }
    return pool.token0.equals(baseToken)
      ? pool.priceOf(pool.token1).quote(amount1).add(amount0)
      : pool.priceOf(pool.token0).quote(amount0).add(amount1);
  }, [baseToken, pool, amount0, amount1]);

  const { percent0, percent1 } = useMemo(() => {
    if (
      !baseToken ||
      !pool ||
      totalLiquidity === 0 ||
      totalLiquidity.equalTo(0)
    ) {
      return { percent0: "0", percent1: "0" };
    }
    const [value0, value1] = pool.token0.equals(baseToken)
      ? [amount0, pool.priceOf(pool.token1).quote(amount1)]
      : [pool.priceOf(pool.token0).quote(amount0), amount1];
    const calcPercent = (val: CurrencyAmount<Token>) =>
      (
        (parseFloat(val.toSignificant(15)) /
          parseFloat(totalLiquidity.toSignificant(15))) *
        100
      ).toFixed(2);

    return { percent0: calcPercent(value0), percent1: calcPercent(value1) };
  }, [totalLiquidity, pool, baseToken, amount0, amount1]);

  const getTypeLabel = (type: TxTypes) => {
    switch (type) {
      case TxTypes.Add:
        return "Add liquidity";
      case TxTypes.Remove:
        return "Remove liquidity";
      case TxTypes.Collect:
        return "Collect fees";
    }
  };

  return (
    <tr>
      <td className="px-4 py-2">
        <a
          href={`${
            BLOCK_EXPLORER_URL[baseToken.chainId]
          }/tx/${transactionHash}`}
          className="flex items-center text-blue-500"
        >
          {format(new Date(timestamp * 1000), "yyyy-MM-dd'T'HH:mm:ss")}
          <IconNewWindow className="ml-2" />
        </a>
      </td>
      <td>{getTypeLabel(transactionType)}</td>
      <td className="px-4 py-2">
        <div>
          <TokenSymbol symbol={pool.token0.symbol} />: {amount0.toFixed(4)}(
          {percent0}%)
        </div>
        <div>
          <TokenSymbol symbol={pool.token1.symbol} />: {amount1.toFixed(4)}(
          {percent1}%)
        </div>
      </td>
      <td className="px-4 py-2">
        {totalLiquidity !== 0
          ? convertToGlobalFormatted(totalLiquidity)
          : formatCurrencyWithSymbol(0, 1)}
      </td>
      <td>{convertToGlobalFormatted(gas.costCurrency)}</td>
    </tr>
  );
}

export default Transaction;
