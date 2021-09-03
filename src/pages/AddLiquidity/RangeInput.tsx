import React, { useState, useEffect } from "react";
import numbro from "numbro";
import {
  tickToPrice,
  priceToClosestTick,
  nearestUsableTick,
} from "@uniswap/v3-sdk";
import { Price, CurrencyAmount, Token } from "@uniswap/sdk-core";

import TokenLabel from "../../ui/TokenLabel";

interface RangeInputProps {
  label: string;
  initTick: number;
  baseToken: Token;
  quoteToken: Token;
  tickSpacing: number;
  tabIndex?: number;
  reverse: boolean;
  onChange: (value: number) => void;
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
}: RangeInputProps) {
  const [input, setInput] = useState<string>("0.00");
  const [tick, setTick] = useState<number>(initTick);

  useEffect(() => {
    const price = parseFloat(
      tickToPrice(baseToken, quoteToken, tick).toSignificant(16)
    );
    const formattedInput = numbro(price).format({
      mantissa: price > 0.01 ? 4 : 8,
      optionalMantissa: true,
      trimMantissa: true,
    });

    setInput(formattedInput);
  }, [quoteToken, baseToken, tick]);

  const handleInput = (ev: { target: any }) => {
    const { value } = ev.target;
    if (value === "") {
      setInput("0.00");
      return;
    }

    setInput(value);
  };

  const calculateTick = () => {
    const inputVal = parseFloat(input);
    if (Number.isNaN(inputVal)) {
      setInput("0.00");
      return;
    }

    if (inputVal === 0) {
      return;
    }

    const price = new Price({
      baseAmount: CurrencyAmount.fromRawAmount(
        baseToken,
        Math.ceil(1 * Math.pow(10, baseToken.decimals))
      ),
      quoteAmount: CurrencyAmount.fromRawAmount(
        quoteToken,
        Math.ceil(inputVal * Math.pow(10, quoteToken.decimals))
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

  return (
    <div className="px-3 py-2 mr-3 border rounded border-gray-400 flex flex-col items-center">
      <div className="my-2 text-gray-600">{label}</div>
      <div className="flex items-center">
        <button
          className="text-2xl px-2 focus:outline-none bg-gray-200 border rounded focus:border-gray-400"
          tabIndex={tabIndex}
          onClick={decreaseValue}
        >
          -
        </button>
        <input
          className="w-36 p-2 text-xl focus:outline-none text-center"
          value={input}
          onChange={handleInput}
          onBlur={calculateTick}
          tabIndex={tabIndex}
          inputMode="decimal"
        />
        <button
          className="text-2xl px-2 focus:outline-none bg-gray-200 border rounded focus:border-gray-400"
          tabIndex={tabIndex}
          onClick={increaseValue}
        >
          +
        </button>
      </div>
      <div className="my-2 text-gray-600">
        <TokenLabel name={quoteToken.name} symbol={quoteToken.symbol} />
        <span> per </span>
        <TokenLabel name={baseToken.name} symbol={baseToken.symbol} />
      </div>
    </div>
  );
}

export default RangeInput;
