import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Token } from '@uniswap/sdk-core';

import { usePoolPriceData } from '../../hooks/usePoolPriceData';
import ChartPeriodSelector from '../../ui/ChartPeriodSelector';

interface Props {
  address: string;
  quoteToken: Token;
  baseToken: Token;
}

function PriceChart({ address, quoteToken, baseToken }: Props) {
  const [period, setPeriod] = useState<number>(30);

  const { priceData, minPrice, maxPrice, meanPrice, stdev } = usePoolPriceData(
    baseToken.chainId,
    address,
    quoteToken,
    baseToken,
    period,
  );

  const handlePeriod = (days: number) => {
    setPeriod(days);
  };

  if (!priceData || !priceData.length) {
    return <div className="text-slate-500 dark:text-slate-200">Loading price data...</div>;
  }

  return (
    <div className="w-full flex flex-col flex-wrap items-start my-2 border border-slate-200 dark:border-slate-700 rounded p-2">
      <ChartPeriodSelector current={period} onSelect={handlePeriod} />
      <ResponsiveContainer width={'100%'} height={200}>
        <LineChart data={priceData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <XAxis dataKey="date" />
          <YAxis
            width={100}
            mirror={true}
            domain={[minPrice - minPrice * 0.1, maxPrice + maxPrice * 0.1]}
          />
          <Tooltip />
          <Legend />
          <Line type="monotone" dot={false} dataKey="price" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      <table className="m-2 w-1/2">
        <tbody>
          <tr>
            <td className="text-slate-500 dark:text-slate-200">Min.</td>
            <td className="text-slate-800 dark:text-slate-400">{minPrice}</td>
          </tr>
          <tr>
            <td className="text-slate-500 dark:text-slate-200">Max.</td>
            <td className="text-slate-800 dark:text-slate-400">{maxPrice}</td>
          </tr>
          <tr>
            <td className="text-slate-500 dark:text-slate-200">Mean</td>
            <td className="text-slate-800 dark:text-slate-400">{meanPrice.toFixed(8)}</td>
          </tr>
          <tr>
            <td className="text-slate-500 dark:text-slate-200">Standard deviation</td>
            <td className="text-slate-800 dark:text-slate-400">{stdev.toFixed(8)}</td>
          </tr>
          <tr>
            <td className="text-slate-500 dark:text-slate-200">Optimal range</td>
            <td className="text-slate-800 dark:text-slate-400">
              {(meanPrice - stdev).toFixed(8)} - {(meanPrice + stdev).toFixed(8)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default PriceChart;
