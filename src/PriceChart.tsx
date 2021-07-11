import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import format from "date-fns/format";

import { Token } from "@uniswap/sdk-core";
import { tickToPrice } from "@uniswap/v3-sdk";

import { usePoolDayData } from "./hooks/usePoolDayData";

interface Props {
  address: string;
  quoteToken: Token;
  baseToken: Token;
}

function PriceChart({ address, quoteToken, baseToken }: Props) {
  const poolDayData = usePoolDayData(address);

  const priceData = useMemo(() => {
    if (!baseToken || !quoteToken) {
      return [];
    }

    return poolDayData
      .map(({ date, tick }: { date: number; tick: number }) => ({
        date: format(new Date(date * 1000), "dd.MMM"),
        price: parseFloat(
          tickToPrice(baseToken, quoteToken, tick).toSignificant(8)
        ),
      }))
      .reverse();
  }, [poolDayData, baseToken, quoteToken]);

  const [minPrice, maxPrice, meanPrice, stdev] = useMemo(() => {
    if (!priceData || !priceData.length) {
      return [0, 0, 0, 0];
    }

    const prices = priceData.map((d: { price: number }) => d.price);

    const sum = (values: number[]) => {
      return values.reduce((s: number, p: number) => {
        return s + p;
      }, 0);
    };

    const pricesSum = sum(prices);

    const pricesSorted = prices.sort((a: number, b: number) => a - b);

    const minPrice = pricesSorted[0];
    const maxPrice = pricesSorted[pricesSorted.length - 1];
    const meanPrice = pricesSum / prices.length;

    const variance =
      sum(prices.map((price: number) => Math.pow(price - meanPrice, 2))) /
      prices.length;
    const stdev = Math.sqrt(variance);

    return [minPrice, maxPrice, meanPrice, stdev];
  }, [priceData]);

  if (!priceData || priceData.length) {
    <div>Loading price data...</div>;
  }

  return (
    <div className="w-full flex flex-col flex-wrap items-start my-2 border rounded p-2">
      <ResponsiveContainer width={"80%"} height={200}>
        <LineChart
          data={priceData}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <XAxis dataKey="date" />
          <YAxis
            width={100}
            mirror={true}
            domain={[minPrice * 0.7, maxPrice * 1.3]}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      <table className="m-2 w-1/2">
        <tbody>
          <tr>
            <td className="text-gray-500">Min.</td>
            <td>{minPrice}</td>
          </tr>
          <tr>
            <td className="text-gray-500">Max.</td>
            <td>{maxPrice}</td>
          </tr>
          <tr>
            <td className="text-gray-500">Mean</td>
            <td>{meanPrice.toFixed(8)}</td>
          </tr>
          <tr>
            <td className="text-gray-500">Standard deviation</td>
            <td>{stdev.toFixed(8)}</td>
          </tr>
          <tr>
            <td className="text-gray-500">Optimal range</td>
            <td>
              {(meanPrice - stdev).toFixed(8)} -{" "}
              {(meanPrice + stdev).toFixed(8)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default PriceChart;
