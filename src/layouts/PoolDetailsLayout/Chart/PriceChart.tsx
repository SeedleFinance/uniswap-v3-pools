import { Token } from '@uniswap/sdk-core';
import React from 'react';
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppSettings } from '../../../providers/AppSettingsProvider';
import { usePoolPriceData } from '../../../hooks/usePoolPriceData';
import LoadingSpinner from '../../../components/Spinner';

interface PriceChartProps {
  address: string;
  quoteToken: Token;
  baseToken: Token;
  period: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ address, quoteToken, baseToken, period }) => {
  const { theme } = useAppSettings();

  const { priceData } = usePoolPriceData(baseToken.chainId, address, quoteToken, baseToken, period);

  function CustomTooltip({ active, payload = '', label = '' }: any) {
    if (payload && active) {
      return (
        <div className="custom-tooltip shadow-sm px-4 py-6 bg-surface-0 border border-element-10 flex flex-col justify-center items-center rounded-sm">
          <span className="label text-high font-medium">{payload[0].value}</span>
          <span className="intro text-0.6875 text-low">{label}</span>
        </div>
      );
    }

    return null;
  }

  if (!priceData || !priceData.length) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <LoadingSpinner color="gray-200" />
      </div>
    );
  }

  const sortedByPrice = [...priceData].sort((a: any, b: any) => a.price - b.price);
  const min = sortedByPrice[0].price;
  const max = sortedByPrice[sortedByPrice.length - 1].price;

  const buffer = 0.2; // 20% buffer on each axis

  const minPriceWithBuffer = min - (max - min) * buffer;
  const maxPriceWithBuffer = max + (max - min) * buffer;
  const yDomain = [minPriceWithBuffer, maxPriceWithBuffer];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={priceData} margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8882D5" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        {/* <CartesianGrid
          strokeDasharray="4 4"
          vertical={false}
          stroke={theme === 'light' ? '#e7e7ed' : '#40444a'}
        /> */}
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#7f879c' }}
          stroke={theme === 'light' ? '#e5e5ee' : '40444a'}
          padding={{ left: 0, right: 15 }}
        />
        <YAxis
          stroke={theme === 'light' ? '#e5e5ee' : '40444a'}
          domain={yDomain}
          axisLine={false}
          padding={{ top: 0, bottom: 0 }}
          tick={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dot={false}
          unit="M"
          dataKey="price"
          stroke="#8884d8"
          strokeWidth={2}
          legendType="none"
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="false"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorUv)"
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default PriceChart;
