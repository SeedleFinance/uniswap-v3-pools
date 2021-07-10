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

    return poolDayData.map(
      ({ date, tick }: { date: string; tick: number }) => ({
        date,
        price: parseFloat(
          tickToPrice(baseToken, quoteToken, tick).toSignificant(8)
        ),
      })
    );
  }, [poolDayData, baseToken, quoteToken]);

  if (!priceData || priceData.length) {
    <div>Loading price data...</div>;
  }

  return (
    <div className="w-full flex flex-col flex-wrap">
      <ResponsiveContainer width={"80%"} height={200}>
        <LineChart data={priceData}>
          <XAxis dataKey="date" />
          <YAxis />
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
    </div>
  );
}

export default PriceChart;
