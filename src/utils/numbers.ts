import numbro from "numbro";

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

export function formatInput(input: number) {
  return numbro(input).format({
    mantissa: input > 0.01 ? 4 : 8,
    optionalMantissa: true,
    trimMantissa: true,
  });
}
