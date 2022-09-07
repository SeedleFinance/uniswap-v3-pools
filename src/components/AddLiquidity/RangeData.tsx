import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Brush,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { tickToPrice } from '@uniswap/v3-sdk';
// import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

import { Token } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';

import { usePoolPriceData } from '../../hooks/usePoolPriceData';
import { usePoolLiquidityData } from '../../hooks/usePoolLiquidityData';
import Menu from '../Menu/Menu';
// import Icon from '../../../components/Icon/Icon';
import ChartPeriodSelector from '../ChartPeriodSelector';

interface Props {
  chainId: number | undefined;
  pool: Pool;
  tickLower: number;
  tickUpper: number;
  baseToken: Token;
  quoteToken: Token;
}

function RangeData({ chainId, pool, tickLower, tickUpper, quoteToken, baseToken }: Props) {
  const [menuOpened, setMenuOpened] = useState(false);
  const [period, setPeriod] = useState<number>(30);

  const [chart, setChart] = useState(0);

  const poolAddress = Pool.getAddress(quoteToken, baseToken, pool.fee).toLowerCase();

  const { priceData, minPrice, maxPrice, meanPrice, stdev } = usePoolPriceData(
    chainId || 1,
    poolAddress,
    quoteToken,
    baseToken,
    period,
  );

  const liquidityData = usePoolLiquidityData(
    chainId || 1,
    poolAddress,
    quoteToken,
    baseToken,
    pool,
  );

  const [priceLower, priceUpper] = useMemo(() => {
    if (!tickLower || !tickUpper || !baseToken || !quoteToken) {
      return [0, 0];
    }

    const convertToPrice = (tick: number) => {
      return parseFloat(tickToPrice(quoteToken, baseToken, tick).toSignificant(8));
    };

    return [convertToPrice(tickLower), convertToPrice(tickUpper)];
  }, [tickLower, tickUpper, baseToken, quoteToken]);

  const domain = useMemo(() => {
    if (!pool) {
      return [0, 0];
    }
    const multiplier = (pool.tickSpacing / 10000) * pool.tickSpacing;
    return [minPrice - minPrice * multiplier, maxPrice + maxPrice * multiplier];
  }, [pool, minPrice, maxPrice]);

  const handleSelect = (item: number) => {
    setMenuOpened(false);
    setChart(item);
  };

  const handlePeriod = (days: number) => {
    setPeriod(days);
  };

  const chartTitles = ['Price', 'Liquidity'];

  return (
    <div className="w-full flex flex-col flex-wrap items-center mt-8 border border-slate-200 dark:border-slate-700 rounded p-2">
      <div className="mb-2">
        <button className="text-lg text-center" onClick={() => setMenuOpened(!menuOpened)}>
          <span>{chartTitles[chart]}</span>
          {/* <Icon className="pl-1 text-xl" icon={faCaretDown} /> */}
        </button>
        {menuOpened && (
          <Menu onClose={() => setMenuOpened(false)}>
            <button onClick={() => handleSelect(0)}>{chartTitles[0]}</button>
            <button onClick={() => handleSelect(1)}>{chartTitles[1]}</button>
          </Menu>
        )}
      </div>

      {chart === 0 && (
        <div className="w-full flex flex-col">
          <ChartPeriodSelector current={period} onSelect={handlePeriod} />
          <ResponsiveContainer width={'100%'} height={200}>
            <LineChart data={priceData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <XAxis dataKey="date" />
              <YAxis width={100} mirror={true} domain={domain} />
              <Tooltip />
              <Legend />
              <ReferenceLine
                y={priceLower}
                stroke="#9a3b38"
                strokeWidth={1}
                ifOverflow="extendDomain"
              />
              <ReferenceLine
                y={priceUpper}
                stroke="#9a3b38"
                strokeWidth={1}
                ifOverflow="extendDomain"
              />
              <Brush dataKey="date" height={30} stroke="#3390d6" />
              <Line type="monotone" dot={false} dataKey="price" stroke="#3390d6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="text-high">Min</td>
                <td className="text-medium">{minPrice}</td>
              </tr>
              <tr>
                <td className="text-high">Max</td>
                <td className="text-medium">{maxPrice}</td>
              </tr>
              <tr>
                <td className="text-high">Mean</td>
                <td className="text-medium">{meanPrice.toFixed(8)}</td>
              </tr>
              <tr>
                <td className="text-high">Standard deviation</td>
                <td className="text-medium">{stdev.toFixed(8)}</td>
              </tr>
              <tr>
                <td className="text-high">Optimal range</td>
                <td className="text-medium">
                  {(meanPrice - stdev).toFixed(8)} - {(meanPrice + stdev).toFixed(8)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {chart === 1 && (
        <ResponsiveContainer width={'100%'} height={200}>
          <AreaChart data={liquidityData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <XAxis dataKey="price" domain={domain} />
            <YAxis hide={true} />
            <Tooltip />
            <Legend />
            <Brush dataKey="price" height={30} stroke="#3390d6" />
            <Area dataKey="liquidity" fill="#3390d6" fillOpacity={0.9} stroke="#3390d6" />
            <ReferenceLine
              x={priceLower}
              stroke="#9a3b38"
              strokeWidth={2}
              ifOverflow="extendDomain"
            />
            <ReferenceLine
              x={priceUpper}
              stroke="#9a3b38"
              strokeWidth={2}
              ifOverflow="extendDomain"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default RangeData;
