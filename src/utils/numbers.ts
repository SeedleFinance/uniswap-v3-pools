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

export function formatInput(input: number, rounding: boolean = true) {
  return numbro(input).format({
    mantissa: input > 0.01 ? 4 : 8,
    optionalMantissa: true,
    trimMantissa: true,
    roundingFunction: rounding ? Math.floor : (val: number) => val,
  });
}

export function multiplyIn256(a: BigNumber, b: BigNumber): BigNumber {
  const c = JSBI.multiply(JSBI.BigInt(a.toString()), JSBI.BigInt(b.toString()));
  return BigNumber.from(JSBI.bitwiseAnd(c, MaxUint256).toString());
}
