import numbro from "numbro";

export function formatCurrency(num: number) {
  return numbro(num).formatCurrency({
    average: false,
    thousandSeparated: true,
    mantissa: 2,
    abbreviations: {
      million: "M",
      billion: "B",
    },
  });
}
