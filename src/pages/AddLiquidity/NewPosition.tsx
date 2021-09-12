import React, { useState, useEffect, useMemo } from "react";
import JSBI from "jsbi";
import { Pool, Position, TickMath } from "@uniswap/v3-sdk";
import { Token, MaxUint256 } from "@uniswap/sdk-core";

import PoolButton from "../../ui/PoolButton";

import RangeInput from "./RangeInput";
import DepositInput from "./DepositInput";

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
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [quoteAmount, setQuoteAmount] = useState<number>(0);

  const [tickLower, setTickLower] = useState<number>(TickMath.MIN_TICK);
  const [tickUpper, setTickUpper] = useState<number>(TickMath.MIN_TICK);

  useEffect(() => {
    if (pool) {
      setFee(pool.fee / 10000);
    }
  }, [pool]);

  const calculateBaseAndQuoteAmounts = (baseVal: number, quoteVal: number) => {
    if (!pool) {
      return;
    }

    if (tickLower === TickMath.MIN_TICK || tickUpper === TickMath.MIN_TICK) {
      return;
    }

    if (baseVal === 0 && quoteVal === 0) {
      return;
    }

    const amount0 =
      baseVal === 0
        ? MaxUint256
        : JSBI.BigInt(baseVal * Math.pow(10, pool.token0.decimals));

    const amount1 =
      quoteVal === 0
        ? MaxUint256
        : JSBI.BigInt(quoteVal * Math.pow(10, pool.token1.decimals));

    const pos = Position.fromAmounts({
      pool,
      tickLower,
      tickUpper,
      amount0,
      amount1,
      useFullPrecision: false,
    });
    setBaseAmount(parseFloat(pos.amount0.toSignificant(2)));
    setQuoteAmount(parseFloat(pos.amount1.toSignificant(2)));
  };

  const suggestedTicks = useMemo(() => {
    if (!positions || !positions.length) {
      return [TickMath.MIN_TICK, TickMath.MIN_TICK];
    }
    const position = positions[0];
    const { tickLower, tickUpper, pool } = position.entity;
    if (pool.token0.equals(baseToken)) {
      return [tickLower, tickUpper];
    }
    return [tickUpper, tickLower];
  }, [positions, baseToken]);

  useEffect(() => {
    setTickLower(suggestedTicks[0]);
    setTickUpper(suggestedTicks[1]);
  }, [suggestedTicks]);

  const rangeReverse = suggestedTicks[0] > suggestedTicks[1];

  const baseDepositChange = (value: number) => {
    calculateBaseAndQuoteAmounts(value, 0);
  };

  const quoteDepositChange = (value: number) => {
    calculateBaseAndQuoteAmounts(0, value);
  };

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
            initTick={suggestedTicks[0]}
            baseToken={baseToken}
            quoteToken={quoteToken}
            tickSpacing={pool.tickSpacing}
            tabIndex={4}
            reverse={rangeReverse}
            onChange={setTickLower}
          />
          <RangeInput
            label="Max"
            initTick={suggestedTicks[1]}
            baseToken={baseToken}
            quoteToken={quoteToken}
            tickSpacing={pool.tickSpacing}
            tabIndex={5}
            reverse={rangeReverse}
            onChange={setTickUpper}
          />
        </div>
      </div>

      <div className="flex flex-col my-2">
        <div>Deposit</div>
        <div className="w-80 my-2">
          <DepositInput
            token={baseToken}
            value={baseAmount}
            tabIndex={6}
            onChange={baseDepositChange}
          />
          <DepositInput
            token={quoteToken}
            value={quoteAmount}
            tabIndex={7}
            onChange={quoteDepositChange}
          />
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
