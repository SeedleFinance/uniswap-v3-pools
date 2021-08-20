import React, { useState, useEffect } from "react";
import { Pool } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";

import PoolButton from "../../ui/PoolButton";
import TokenLabel from "../../ui/TokenLabel";

interface FeeButtonProps {
  fee: number;
  selected: boolean;
  onClick: () => void;
}

function FeeButton({ fee, selected, onClick }: FeeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 my-1 mr-1 border rounded border-gray-400 focus:outline-none ${
        selected ? "border-blue-400 bg-blue-100" : ""
      }`}
    >
      {fee}%
    </button>
  );
}

interface RangeInputProps {
  label: string;
  initValue: number;
  baseToken: Token;
  quoteToken: Token;
}

function RangeInput({
  label,
  baseToken,
  quoteToken,
  initValue,
}: RangeInputProps) {
  const [value, setValue] = useState(initValue);

  const handleInput = (ev: { target: any }) => {
    const { value } = ev.target;
    setValue(value);
  };

  return (
    <div className="p-2 mr-3 border rounded border-gray-400 flex flex-col items-center">
      <div className="my-2 text-gray-600">{label}</div>
      <div className="flex items-center">
        <button className="text-2xl px-2 focus:outline-none bg-gray-200 border rounded">
          -
        </button>
        <input
          className="w-36 p-2 text-xl focus:outline-none text-center"
          value={value}
          onChange={handleInput}
        />
        <button className="text-2xl px-2 focus:outline-none bg-gray-200 border rounded">
          +
        </button>
      </div>
      <div className="my-2 text-gray-600">
        <TokenLabel name={baseToken.name} symbol={baseToken.symbol} />
        <span> per </span>
        <TokenLabel name={quoteToken.name} symbol={quoteToken.symbol} />
      </div>
    </div>
  );
}

interface Props {
  baseToken: Token | null;
  quoteToken: Token | null;
  pool: Pool | null;
  positions: any[] | null;
}

function NewPosition({ baseToken, quoteToken, pool, positions }: Props) {
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
          />
          <FeeButton
            fee={0.3}
            selected={fee === 0.3}
            onClick={() => setFee(0.3)}
          />
          <FeeButton fee={1} selected={fee === 1} onClick={() => setFee(1)} />
        </div>
      </div>

      <div className="flex flex-col my-2">
        <div>Range</div>
        <div className="w-1/3 my-2 flex justify-between">
          <RangeInput
            label="Min"
            initValue={0}
            baseToken={baseToken}
            quoteToken={quoteToken}
          />
          <RangeInput
            label="Max"
            initValue={0}
            baseToken={baseToken}
            quoteToken={quoteToken}
          />
        </div>
      </div>
      <div>Deposit</div>
    </div>
  );
}

export default NewPosition;
