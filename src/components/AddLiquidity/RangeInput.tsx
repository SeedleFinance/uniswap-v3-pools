import React, { useState, useEffect, useMemo, useRef } from 'react';
import { tickToPrice, priceToClosestTick, nearestUsableTick } from '@uniswap/v3-sdk';
import { Price, CurrencyAmount, Token } from '@uniswap/sdk-core';

import TokenLabel from '../TokenLabel';
import { formatInput } from '../../utils/numbers';

interface RangeInputProps {
  label: string;
  initTick: number;
  baseToken: Token;
  quoteToken: Token;
  tickSpacing: number;
  tabIndex?: number;
  reverse: boolean;
  onChange: (value: number) => void;
  onFocus: (el: HTMLInputElement | null) => void;
}

function RangeInput({
  label,
  baseToken,
  quoteToken,
  initTick,
  tickSpacing,
  tabIndex,
  reverse,
  onChange,
  onFocus,
}: RangeInputProps) {
  const inputEl = useRef(null);

  const [input, setInput] = useState<string>('0.00');
  const [tick, setTick] = useState<number>(initTick);

  const [token0, token1] = useMemo(() => {
    return [baseToken, quoteToken];
  }, [quoteToken, baseToken]);

  useEffect(() => {
    setTick(initTick);
  }, [initTick]);

  useEffect(() => {
    const price = parseFloat(tickToPrice(token1, token0, tick).toSignificant(16));

    setInput(formatInput(price, false, tickSpacing === 1 ? 8 : 4));
  }, [token0, token1, tick, tickSpacing]);

  const handleInput = (ev: { target: any }) => {
    const { value } = ev.target;
    if (value === '') {
      setInput('0.00');
      return;
    }

    setInput(value);
  };

  const calculateTick = () => {
    const inputVal = parseFloat(input);
    if (Number.isNaN(inputVal)) {
      setInput('0.00');
      return;
    }

    if (inputVal === 0) {
      return;
    }

    const price = new Price({
      quoteAmount: CurrencyAmount.fromRawAmount(
        token0,
        Math.ceil(inputVal * Math.pow(10, token0.decimals)),
      ),
      baseAmount: CurrencyAmount.fromRawAmount(
        token1,
        Math.ceil(1 * Math.pow(10, token1.decimals)),
      ),
    });

    const tickFromPrice = priceToClosestTick(price);
    const closestTick = nearestUsableTick(tickFromPrice, tickSpacing);
    setTick(closestTick);

    onChange(closestTick);
  };

  const decreaseValue = () => {
    setTick(reverse ? tick + tickSpacing : tick - tickSpacing);
  };

  const increaseValue = () => {
    setTick(reverse ? tick - tickSpacing : tick + tickSpacing);
  };

  const handleFocus = () => {
    if (inputEl.current) {
      onFocus(inputEl.current);
    }
  };

  return (
    <div className="px-3 py-2 mr-3 border rounded border-gray-400 flex flex-col items-center">
      <div className="my-2 text-slate-600 dark:text-slate-300">{label}</div>
      <div className="flex items-center">
        <button
          className="text-2xl px-2 focus:outline-none bg-slate-200 dark:bg-slate-700 border rounded focus:border-gray-400"
          tabIndex={tabIndex}
          onClick={decreaseValue}
          onBlur={calculateTick}
        >
          -
        </button>
        <input
          ref={inputEl}
          className="w-36 p-2 text-xl focus:outline-none text-center bg-white dark:bg-slate-900"
          value={input}
          onChange={handleInput}
          onFocus={handleFocus}
          onBlur={calculateTick}
          tabIndex={tabIndex}
          inputMode="decimal"
        />
        <button
          className="text-2xl px-2 focus:outline-none bg-slate-200 dark:bg-slate-700 border rounded focus:border-gray-400"
          tabIndex={tabIndex}
          onClick={increaseValue}
          onBlur={calculateTick}
        >
          +
        </button>
      </div>
      <div className="my-2 text-slate-600 dark:text-slate-300">
        <TokenLabel name={baseToken.name} symbol={baseToken.symbol} />
        <span> per </span>
        <TokenLabel name={quoteToken.name} symbol={quoteToken.symbol} />
      </div>
    </div>
  );
}

export default RangeInput;
