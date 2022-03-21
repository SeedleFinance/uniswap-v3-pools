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
import { Pool } from "@uniswap/v3-sdk";

import { useFeeTierData } from "../../hooks/useFeeTierData";

interface Props {
  chainId: number | null;
  baseToken: Token | null;
  quoteToken: Token | null;
  selected: number;
}

function FeeTierData({ chainId, baseToken, quoteToken, selected }: Props) {
  const poolAddresses = useMemo(() => {
    if (!chainId || !baseToken || !quoteToken) {
      return [];
    }

    return [100, 500, 3000, 10000].map((fee) =>
      Pool.getAddress(quoteToken, baseToken, fee).toLowerCase()
    );
  }, [baseToken, quoteToken]);

  const data = useFeeTierData(chainId, poolAddresses);

  const { tvl, fees, feesOverTvl } = useMemo(() => {
    if (!poolAddresses || !poolAddresses.length) {
      return [];
    }
    if (!data || !data.length) {
      return [];
    }

    const tierLabels = ["0.01", "0.05", "0.3", "1"];

    const tvl = [];
    const fees = [];
    const feesOverTvl = [];
    data.forEach((tier) => {
      tier.forEach((day, i) => {
        let a = tvl[i] || {};
        let b = fees[i] || {};
        let c = feesOverTvl[i] || {};
        const formattedDate = format(new Date(day.date * 1000), "dd.MMM");
        const tierLabel =
          tierLabels[poolAddresses.indexOf(day.id.split("-")[0]) || 0];

        a.date = formattedDate;
        b.date = formattedDate;
        c.date = formattedDate;

        a[tierLabel] = day.tvlUSD;
        b[tierLabel] = day.feesUSD;
        c[tierLabel] = day.feesUSD / day.tvlUSD;

        tvl[i] = a;
        fees[i] = b;
        feesOverTvl[i] = c;
      });
    });

    return { tvl, fees, feesOverTvl };
  }, [data, poolAddresses]);

  if (!data || !data.length) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="w-full flex flex-col flex-wrap items-center my-2 border border-slate-200 dark:border-slate-700 rounded p-2">
      <div className="text-lg text-center">Fees / TVL for each fee tier</div>
      <ResponsiveContainer width={"80%"} height={200}>
        <LineChart
          data={tvl}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <XAxis dataKey="date" />
          <YAxis width={100} mirror={true} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="0.01"
            name="0.01%"
            stroke="#ffc999"
            strokeWidth={selected === 100 ? 3 : 2}
          />
          <Line
            type="monotone"
            dataKey="0.05"
            name="0.05%"
            stroke="#c390d2"
            strokeWidth={selected === 500 ? 3 : 2}
          />
          <Line
            type="monotone"
            dataKey="0.3"
            name="0.3%"
            stroke="#3390d6"
            strokeWidth={selected === 3000 ? 3 : 2}
          />
          <Line
            type="monotone"
            dataKey="1"
            name="1%"
            stroke="#fea0ac"
            strokeWidth={selected === 10000 ? 3 : 2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default FeeTierData;
