import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Brush,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";

import { usePoolLiquidityData } from "../../hooks/usePoolLiquidityData";

interface Props {
  address: string;
  quoteToken: Token;
  baseToken: Token;
  pool: Pool;
}

function LiquidityChart({ address, quoteToken, baseToken, pool }: Props) {
  const liquidityData = usePoolLiquidityData(
    baseToken.chainId || 1,
    address,
    quoteToken,
    baseToken,
    pool
  );
  console.log(liquidityData);

  if (!liquidityData || !liquidityData.length) {
    return <div>Loading liquidity data...</div>;
  }

  return (
    <div className="w-full flex flex-col flex-wrap items-start my-2 border border-slate-200 dark:border-slate-700 rounded p-2">
      <ResponsiveContainer width={"100%"} height={200}>
        <AreaChart
          data={liquidityData}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <XAxis dataKey="price" />
          <YAxis hide={true} />
          <Tooltip />
          <Legend />
          <Brush dataKey="price" height={30} stroke="#3390d6" />
          <Area
            dataKey="liquidity"
            fill="#3390d6"
            fillOpacity={0.9}
            stroke="#3390d6"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LiquidityChart;
