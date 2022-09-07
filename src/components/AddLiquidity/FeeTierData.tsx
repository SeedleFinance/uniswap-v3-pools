import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
// import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

import format from 'date-fns/format';
import { Token } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';

import { useFeeTierData } from '../../hooks/useFeeTierData';
import Menu from '../Menu/Menu';
// import Icon from '../../../components/Icon/Icon';

interface Props {
  chainId: number | undefined;
  baseToken: Token | null;
  quoteToken: Token | null;
  currentValue: number;
}

function FeeTierData({ chainId, baseToken, quoteToken, currentValue }: Props) {
  const [menuOpened, setMenuOpened] = useState(false);
  const [chart, setChart] = useState(0);

  const poolAddresses = useMemo(() => {
    if (!baseToken || !quoteToken) {
      return [];
    }

    return [100, 500, 3000, 10000].map((fee) =>
      Pool.getAddress(quoteToken, baseToken, fee).toLowerCase(),
    );
  }, [baseToken, quoteToken]);

  const data = useFeeTierData(chainId || 1, poolAddresses);

  const chartData = useMemo(() => {
    const tvl: any[] = [];
    const fees: any[] = [];
    const feesOverTvl: any[] = [];

    if (!poolAddresses || !poolAddresses.length || !data || !data.length) {
      return [tvl, fees, feesOverTvl];
    }

    const tierLabels = ['0.01', '0.05', '0.3', '1'];

    data.forEach((tier: any, i: number) => {
      const tierLabel = tierLabels[i];

      tier.forEach((day: any, di: number) => {
        let a = tvl[di] || {};
        let b = fees[di] || {};
        let c = feesOverTvl[di] || {};
        const formattedDate = format(new Date(day.date * 1000), 'dd.MMM');

        a.date = formattedDate;
        b.date = formattedDate;
        c.date = formattedDate;

        a[tierLabel] = day.tvlUSD;
        b[tierLabel] = day.feesUSD;
        c[tierLabel] = day.feesUSD / day.tvlUSD;

        tvl[di] = a;
        fees[di] = b;
        feesOverTvl[di] = c;
      });
    });

    return [tvl, fees, feesOverTvl];
  }, [data, poolAddresses]);

  const handleSelect = (item: number) => {
    setMenuOpened(false);
    setChart(item);
  };
  const chartTitles = ['TVL', 'Fees', 'Fees / TVL'];

  if (!data || !data.length) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="w-full flex flex-col flex-wrap items-center mt-8 border border-slate-200 dark:border-slate-700 rounded p-2">
      <div className="mb-2">
        <button className="text-lg text-center" onClick={() => setMenuOpened(!menuOpened)}>
          <span>{chartTitles[chart]} (by fee tier)</span>
          {/* <Icon className="pl-1 text-xl" icon={faCaretDown} /> */}
        </button>
        {menuOpened && (
          <Menu onClose={() => setMenuOpened(false)}>
            <button onClick={() => handleSelect(0)}>{chartTitles[0]}</button>
            <button onClick={() => handleSelect(1)}>{chartTitles[1]}</button>
            <button onClick={() => handleSelect(2)}>{chartTitles[2]}</button>
          </Menu>
        )}
      </div>
      <ResponsiveContainer width={'80%'} height={200}>
        <LineChart data={chartData[chart]} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <XAxis dataKey="date" />
          <YAxis width={100} mirror={true} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dot={false}
            dataKey="0.01"
            name="0.01%"
            stroke="#ffc999"
            strokeWidth={currentValue === 100 ? 3 : 2}
          />
          <Line
            type="monotone"
            dot={false}
            dataKey="0.05"
            name="0.05%"
            stroke="#c390d2"
            strokeWidth={currentValue === 500 ? 3 : 2}
          />
          <Line
            type="monotone"
            dot={false}
            dataKey="0.3"
            name="0.3%"
            stroke="#3390d6"
            strokeWidth={currentValue === 3000 ? 3 : 2}
          />
          <Line
            type="monotone"
            dot={false}
            dataKey="1"
            name="1%"
            stroke="#fea0ac"
            strokeWidth={currentValue === 10000 ? 3 : 2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default FeeTierData;
