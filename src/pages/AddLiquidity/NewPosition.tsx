import React, { useState, useEffect } from "react";
import numbro from "numbro";
import {
  Pool,
  TickMath,
  tickToPrice,
  priceToClosestTick,
  nearestUsableTick,
} from "@uniswap/v3-sdk";
import { Price, CurrencyAmount, Token } from "@uniswap/sdk-core";

import PoolButton from "../../ui/PoolButton";
import TokenLabel from "../../ui/TokenLabel";
import TokenLogo from "../../ui/TokenLogo";

interface FeeButtonProps {
  fee: number;
  selected: boolean;
  onClick: () => void;
  tabIndex?: number;
}

function FeeButton({ fee, selected, onClick, tabIndex }: FeeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 my-1 mr-1 border rounded border-gray-400 focus:outline-none focus:border-gray-800 ${
        selected ? "border-blue-400 bg-blue-100" : ""
      }`}
      tabIndex={tabIndex || 0}
    >
      {fee}%
    </button>
  );
}

interface RangeInputProps {
  label: string;
  initInput: number;
  baseToken: Token;
  quoteToken: Token;
  pool: Pool;
  tabIndex?: number;
}

function RangeInput({
  label,
  baseToken,
  quoteToken,
  initInput,
  pool,
  tabIndex,
}: RangeInputProps) {
  const [input, setInput] = useState<string>((initInput || 0).toFixed(2));
  const [tick, setTick] = useState<number>(TickMath.MIN_TICK);

  const handleInput = (ev: { target: any }) => {
    const { value } = ev.target;
    if (value === "") {
      setInput("0.00");
      return;
    }

    setInput(value);
  };

  const calculateTickAndPrice = () => {
    const inputVal = parseFloat(input);
    if (inputVal === 0) {
      return;
    }

    const price = new Price({
      baseAmount: CurrencyAmount.fromRawAmount(
        quoteToken,
        Math.ceil(1 * Math.pow(10, quoteToken.decimals))
      ),
      quoteAmount: CurrencyAmount.fromRawAmount(
        baseToken,
        Math.ceil(inputVal * Math.pow(10, baseToken.decimals))
      ),
    });

    const tickFromPrice = priceToClosestTick(price);
    const closestTick = nearestUsableTick(tickFromPrice, pool.tickSpacing);

    const newPrice = parseFloat(
      tickToPrice(quoteToken, baseToken, closestTick).toSignificant(16)
    );
    const formattedInput = numbro(newPrice).format({
      mantissa: 4,
      optionalMantissa: true,
      trimMantissa: true,
    });

    console.log(closestTick);
    setTick(closestTick);
    setInput(formattedInput);
  };

  const decreaseValue = () => {};

  const increaseValue = () => {};

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
          onBlur={calculateTickAndPrice}
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

interface DepositInputProps {
  token: Token;
  initValue: number;
  tabIndex: number;
}

function DepositInput({ token, initValue, tabIndex }: DepositInputProps) {
  return (
    <div className="flex items-center border rounded p-2 my-2">
      <div className="w-1/3 flex items-center p-1 justify-between bg-gray-100 border rounded">
        <TokenLogo name={token.name} address={token.address} />
        <TokenLabel name={token.name} symbol={token.symbol} />
      </div>
      <input
        className="w-2/3 focus:outline-none text-2xl p-2 text-right"
        type="text"
        value={initValue}
        tabIndex={tabIndex}
      />
    </div>
  );
}

interface Props {
  baseToken: Token | null;
  quoteToken: Token | null;
  pool: Pool | null;
  positions: any[] | null;
  onCancel: () => void;
}

function NewPosition({
  baseToken,
  quoteToken,
  pool,
  positions,
  onCancel,
}: Props) {
  const [fee, setFee] = useState<number>(0.3);

  useEffect(() => {
    if (pool) {
      setFee(pool.fee / 10000);
    }
  }, [pool]);

  if (!pool || !baseToken || !quoteToken) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-col my-2">
        <div>Pair</div>
        <div className="w-80 my-2 p-2 text-lg border rounded border-blue-400 bg-blue-100">
          <PoolButton
            baseToken={baseToken}
            quoteToken={quoteToken}
            onClick={() => {}}
            tabIndex={0}
          />
        </div>
      </div>

      <div className="flex flex-col my-2">
        <div>Fee tier</div>
        <div className="w-48 my-2 flex justify-between">
          <FeeButton
            fee={0.05}
            selected={fee === 0.05}
            onClick={() => setFee(0.05)}
            tabIndex={1}
          />
          <FeeButton
            fee={0.3}
            selected={fee === 0.3}
            onClick={() => setFee(0.3)}
            tabIndex={2}
          />
          <FeeButton
            fee={1}
            selected={fee === 1}
            onClick={() => setFee(1)}
            tabIndex={3}
          />
        </div>
      </div>

      <div className="flex flex-col my-2">
        <div>Range</div>
        <div className="w-1/3 my-2 flex justify-between">
          <RangeInput
            label="Min"
            initInput={0}
            baseToken={baseToken}
            quoteToken={quoteToken}
            pool={pool}
            tabIndex={4}
          />
          <RangeInput
            label="Max"
            initInput={0}
            baseToken={baseToken}
            quoteToken={quoteToken}
            pool={pool}
            tabIndex={5}
          />
        </div>
      </div>

      <div className="flex flex-col my-2">
        <div>Deposit</div>
        <div className="w-80 my-2">
          <DepositInput token={baseToken} initValue={0} tabIndex={6} />
          <DepositInput token={quoteToken} initValue={0} tabIndex={7} />
        </div>
      </div>

      <div className="w-48 my-2 flex justify-between">
        <button
          className="p-2 focus:outline-none text-gray-500 border rounded border-gray-500 font-bold"
          tabIndex={8}
        >
          Add Liquidity
        </button>
        <button onClick={onCancel} tabIndex={9}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default NewPosition;
