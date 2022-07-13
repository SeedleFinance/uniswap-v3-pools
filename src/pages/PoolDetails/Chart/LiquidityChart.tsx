import React from 'react';
import { ResponsiveContainer, AreaChart, Area, Brush, XAxis, YAxis, Tooltip } from 'recharts';
import { Token } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';

import { usePoolLiquidityData } from '../../../hooks/usePoolLiquidityData';
import LoadingSpinner from '../../../ui/Spinner';
import { useAppSettings } from '../../../AppSettingsProvider';

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
    pool,
  );

  const { theme } = useAppSettings();

  if (!liquidityData || !liquidityData.length) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <LoadingSpinner color="gray-200" />
      </div>
    );
  }

  function CustomTooltip({ active, payload = '', label = '' }: any) {
    if (payload && active) {
      return (
        <div className="custom-tooltip shadow-sm px-4 py-6 bg-surface-0 border border-element-10 flex flex-col justify-center items-center rounded-sm">
          <span className="label text-high font-medium">${label}</span>
        </div>
      );
    }

    return null;
  }

  return (
    <ResponsiveContainer width={'100%'} height="100%">
      <AreaChart data={liquidityData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <XAxis
          dataKey="price"
          tick={{ fontSize: 12, fill: '#7f879c' }}
          stroke={theme === 'light' ? '#e5e5ee' : '#ccc'}
        />
        <YAxis hide={true} />
        <Tooltip content={<CustomTooltip />} />
        <Brush dataKey="price" height={30} stroke="#8882D5" />
        <Area dataKey="liquidity" fill="#8882D5" fillOpacity={0.9} stroke="#8882D5" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default LiquidityChart;
