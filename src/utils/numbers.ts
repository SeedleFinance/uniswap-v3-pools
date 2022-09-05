import numbro from "numbro";
import JSBI from "jsbi";
import { BigNumber } from "@ethersproject/bignumber";
import { MaxUint256 } from "@uniswap/sdk-core";

export function formatCurrency(num: number, symbol?: string) {
  return numbro(num).formatCurrency({
    average: false,
    thousandSeparated: true,
    mantissa: 2,
    currencySymbol: symbol || "$",
    abbreviations: {
      million: "M",
      billion: "B",
    },
  });
}

export function formatInput(
  input: number,
  rounding: boolean = true,
  mantissa: number = 4
) {
  if (isNaN(input)) {
    return "0";
  }

  return numbro(input).format({
    mantissa: input > 0.01 ? mantissa : 8,
    optionalMantissa: true,
    trimMantissa: mantissa === 4,
    roundingFunction: rounding ? Math.floor : (val: number) => val,
  });
}

export function multiplyIn256(a: BigNumber, b: BigNumber): BigNumber {
  const c = JSBI.multiply(JSBI.BigInt(a.toString()), JSBI.BigInt(b.toString()));
  return BigNumber.from(JSBI.bitwiseAnd(c, MaxUint256).toString());
}
