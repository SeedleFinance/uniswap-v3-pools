import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Token } from '@uniswap/sdk-core';

import { usePoolPriceData } from '../../hooks/usePoolPriceData';
import ChartPeriodSelector from '../../ui/ChartPeriodSelector';
import LoadingSpinner from '../../ui/Spinner';
import { useAppSettings } from '../../AppSettingsProvider';
import Card from '../../ui/Card';

interface Props {
  address: string;
  quoteToken: Token;
  baseToken: Token;
}

function PriceChart({ address, quoteToken, baseToken }: Props) {
  const [period, setPeriod] = useState<number>(30);
  const { theme } = useAppSettings();

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
    <div className="w-full flex flex-col flex-wrap items-start border border-element-10 my-4 p-2 md:p-6">
      <ChartPeriodSelector current={period} onSelect={handlePeriod} />
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={priceData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke={theme === 'light' ? '37383a' : '#ccc'}
          />
          <YAxis
            width={100}
            mirror={true}
            domain={[minPrice - minPrice * 0.1, maxPrice + maxPrice * 0.1]}
            tick={{ fontSize: 11 }}
            stroke={theme === 'light' ? '#37383a' : '#ccc'}
            style={{ display: 'none' }}
          />
          <Tooltip />
          <Line type="monotone" dot={false} dataKey="price" stroke="#8884d8" strokeWidth={2} />
          <CartesianGrid
            strokeDasharray="0 0"
            vertical={false}
            stroke={theme === 'light' ? '#e7e7ed' : '#40444a'}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex w-full flex-wrap text-0.75">
        <Card className="mx-2 my-1 justify-center shadow-sm">
          <h3>Min Price</h3>
          <div className="font-bold text-1">{minPrice}</div>
        </Card>
        <Card className="mx-2 my-1 justify-center shadow-sm">
          <h3>Max Price</h3>
          <div className="font-bold text-1">{maxPrice}</div>
        </Card>
        <Card className="mx-2 my-1 justify-center shadow-sm">
          <h3>Average Price</h3>
          <div className="font-bold text-1">{meanPrice.toFixed(8)}</div>
        </Card>

        <Card className="mx-2 my-1 justify-center shadow-sm">
          <h3>Optimal range</h3>
          <div className="font-bold text-1">
            {(meanPrice - stdev).toFixed(8)} - {(meanPrice + stdev).toFixed(8)}
          </div>
          <div className="flex">
            <span>(SD: {stdev.toFixed(8)})</span>
          </div>
        </Card>
      </div>
      {/* <table className="w-full table-auto border border-element-10">
        <tbody className="text-0.875 text-high">
          <thead>
            <tr>
              <td>Min:</td>
            </tr>
            <tr>
              <td>Max:</td>
            </tr>
            <tr>
              <td>Mean:</td>
            </tr>
            <tr>
              <td>Standard deviation:</td>
            </tr>
            <tr></tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-low">{maxPrice}</td>
            </tr>
            <tr>
              <td className="text-low">{meanPrice.toFixed(8)}</td>
            </tr>
            <tr>
              <td className="text-low">{stdev.toFixed(8)}</td>
            </tr>
            <tr>
              <td className="text-low">
                {(meanPrice - stdev).toFixed(8)} - {(meanPrice + stdev).toFixed(8)}
              </td>
            </tr>
          </tbody>
        </tbody>
      </table> */}
    </div>
  );
}

export default PriceChart;
