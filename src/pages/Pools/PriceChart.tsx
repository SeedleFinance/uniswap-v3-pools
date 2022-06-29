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
    <div className="w-full flex flex-col flex-wrap items-start">
      <ChartPeriodSelector current={period} onSelect={handlePeriod} />
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={priceData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
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
      <table className="w-1/2">
        <tbody className="text-0.875 text-high">
          <tr>
            <td>Min:</td>
            <td className="text-low">{minPrice}</td>
          </tr>
          <tr>
            <td>Max:</td>
            <td className="text-low">{maxPrice}</td>
          </tr>
          <tr>
            <td>Mean:</td>
            <td className="text-low">{meanPrice.toFixed(8)}</td>
          </tr>
          <tr>
            <td>Standard deviation:</td>
            <td className="text-low">{stdev.toFixed(8)}</td>
          </tr>
          <tr>
            <td>Optimal range:</td>
            <td className="text-low">
              {(meanPrice - stdev).toFixed(8)} - {(meanPrice + stdev).toFixed(8)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default PriceChart;
