import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Token } from '@uniswap/sdk-core';

import { usePoolPriceData } from '../../hooks/usePoolPriceData';
import ChartPeriodSelector from '../../ui/ChartPeriodSelector';
import LoadingSpinner from '../../ui/Spinner';

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
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full flex flex-col flex-wrap items-start my-2 border border-slate-200 dark:border-slate-700 rounded p-2">
      <ChartPeriodSelector current={period} onSelect={handlePeriod} />
      <ResponsiveContainer width={'100%'} height={200}>
        <LineChart data={priceData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <XAxis dataKey="date" tick={{ fontSize: 13 }} />
          <YAxis
            width={100}
            mirror={true}
            domain={[minPrice - minPrice * 0.1, maxPrice + maxPrice * 0.1]}
            tick={{ fontSize: 13 }}
          />
          <Tooltip />
          <Legend />
          <Line type="monotone" dot={false} dataKey="price" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      <table className="m-2 w-1/2">
        <tbody className="text-0.875 text-medium">
          <tr>
            <td>Min.</td>
            <td>{minPrice}</td>
          </tr>
          <tr>
            <td>Max.</td>
            <td>{maxPrice}</td>
          </tr>
          <tr>
            <td>Mean</td>
            <td>{meanPrice.toFixed(8)}</td>
          </tr>
          <tr>
            <td>Standard deviation</td>
            <td>{stdev.toFixed(8)}</td>
          </tr>
          <tr>
            <td>Optimal range</td>
            <td>
              {(meanPrice - stdev).toFixed(8)} - {(meanPrice + stdev).toFixed(8)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default PriceChart;
