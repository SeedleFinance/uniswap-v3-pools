import { useMemo } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { Token, CurrencyAmount } from "@uniswap/sdk-core";
import { Pool as UniPool } from "@uniswap/v3-sdk";

import {
  useTransactionTotals,
  useReturnValue,
  useAPR,
  usePoolFeeAPY,
} from '../../hooks/calculations';
import { useCurrencyConversions } from '../../providers/CurrencyConversionProvider';

import LoadingSpinner from "../../components/Spinner";
import Tooltip from "../../components/Tooltip";
import IconHelper from "../../components/icons/Helper";
import TokenLabel from "../../components/TokenLabel";
import { CustomPosition } from "../../types/seedle";
import { LABELS } from "../../common/constants";

interface PoolProps {
  address: string;
  entity: UniPool;
  quoteToken: Token;
  baseToken: Token;
  rawPoolLiquidity: BigNumber;
  poolLiquidity: CurrencyAmount<Token>;
  currencyPoolUncollectedFees: CurrencyAmount<Token>[];
  poolUncollectedFees: CurrencyAmount<Token>;
  positions: CustomPosition[];
}

function Pool({
  address,
  entity,
  quoteToken,
  baseToken,
  positions,
  poolLiquidity,
  rawPoolLiquidity,
  currencyPoolUncollectedFees,
  poolUncollectedFees,
}: PoolProps) {
  const { convertToGlobalFormatted } = useCurrencyConversions();

  const totalValue = useMemo(() => {
    return poolLiquidity.add(poolUncollectedFees);
  }, [poolLiquidity, poolUncollectedFees]);

  const poolTransactions = useMemo(() => {
    return positions.reduce((txs: any[], { transactions }: any) => {
      txs.push(...transactions);
      return txs;
    }, []);
  }, [positions]);

  // total distribution – from all positions
  const distribution = useMemo(() => {
    let amount0 = CurrencyAmount.fromRawAmount(entity.token0, "0");
    let amount1 = CurrencyAmount.fromRawAmount(entity.token1, "0");

    positions.forEach((position) => {
      amount0 = amount0.add(position.entity.amount0);
      amount1 = amount1.add(position.entity.amount1);
    });

    return [amount0, amount1];
  }, [entity, positions]);

  const {
    totalMintValue,
    totalBurnValue,
    totalCollectValue,
    totalTransactionCost,
  } = useTransactionTotals(poolTransactions, baseToken, entity);

  const { returnValue, returnPercent } = useReturnValue(
    baseToken,
    totalMintValue,
    totalBurnValue,
    totalCollectValue,
    totalTransactionCost,
    totalValue
  );

  const totalFees = totalCollectValue.add(poolUncollectedFees);

  const apr = useAPR(poolTransactions, returnPercent, rawPoolLiquidity);

  const feeAPY = usePoolFeeAPY(entity, baseToken, positions);

  if (!baseToken || !quoteToken || !entity) {
    return (
      <div className="my-4 p-4 border rounded-md">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto bg-surface-0 shadow-sm mt-4 rounded-lg">
        <table className="table-auto w-full text-high text-0.875">
          <thead className="border-b border-element-10">
            <tr className="text-left align-middle">
              <th className="pb-3 px-6 py-5 whitespace-nowrap font-medium">
                Total Distribution
              </th>
              <th className="pb-3 px-6 py-5 whitespace-nowrap font-medium">
                Total Liquidity
              </th>
              <th className="pb-3 px-6 py-5 whitespace-nowrap font-medium">
                Total Fees
              </th>
              <th className="pb-3 px-6 py-5 font-medium">
                <Tooltip label={LABELS.FEE_APY} placement="top">
                  <span className="flex items-center cursor-default whitespace-nowrap">
                    Fee APY
                    <IconHelper className="ml-1" />
                  </span>
                </Tooltip>
              </th>
              <th className="pb-3 px-4 py-5 font-medium">
                <Tooltip label={LABELS.NET_RETURN} placement="top-start">
                  <span className="flex items-center cursor-default whitespace-nowrap">
                    Net Return
                    <IconHelper className="ml-1" />
                  </span>
                </Tooltip>
              </th>
              <th className="pb-3 px-4 py-5 font-medium">
                <Tooltip label={LABELS.NET_APY} placement="top">
                  <span className="flex items-center cursor-default whitespace-nowrap">
                    Net APY
                    <IconHelper className="ml-1" />
                  </span>
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody className="text-0.875 align-wtop">
            <tr>
              <td className="px-4 py-6 flex flex-col font-medium">
                {distribution.map((token: any) => (
                  <div className="flex px-2" key={token.currency.symbol}>
                    <TokenLabel symbol={token.currency.symbol} size="sm" />
                    {token.toSignificant(6)}
                  </div>
                ))}
              </td>

              <td className="px-4 py-6">
                {convertToGlobalFormatted(poolLiquidity)}
              </td>
              <td className="px-4 py-6">
                {convertToGlobalFormatted(totalFees)} (uncl.{" "}
                {convertToGlobalFormatted(poolUncollectedFees)})
              </td>
              <td className="px-4 py-6">
                <div className={feeAPY < 0 ? "text-red-500" : "text-green-500"}>
                  {feeAPY.toFixed(2)}%
                </div>
              </td>

              <td className="px-4 py-6">
                <div
                  className={
                    returnValue.lessThan(0) ? "text-red-500" : "text-green-500"
                  }
                >
                  {convertToGlobalFormatted(returnValue)} (
                  {returnPercent.toFixed(2)}%)
                </div>
              </td>
              <td className="px-4 py-6">
                <div className={apr < 0 ? "text-red-500" : "text-green-500"}>
                  {apr.toFixed(2)}%
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Pool;
