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
