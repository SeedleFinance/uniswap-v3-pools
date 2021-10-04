import React, { useState, useEffect, useMemo } from "react";
import JSBI from "jsbi";
import { useWeb3React } from "@web3-react/core";
import { Pool, Position, TickMath, tickToPrice } from "@uniswap/v3-sdk";
import { Token, MaxUint256 } from "@uniswap/sdk-core";

import { useTokenBalances } from "../../hooks/useTokenBalances";
import { usePool } from "../../hooks/usePool";
import PoolButton from "../../ui/PoolButton";
import TokenLabel from "../../ui/TokenLabel";

import RangeInput from "./RangeInput";
import DepositInput from "./DepositInput";
import FeeButton from "./FeeButton";

import { formatInput } from "../../utils/numbers";

function positionFromAmounts(
  {
    pool,
    tickLower,
    tickUpper,
    val0,
    val1,
  }: {
    pool: Pool;
    tickLower: number;
    tickUpper: number;
    val0: number;
    val1: number;
  },
  reverse: boolean
): [number, number] {
  if (reverse) {
    [tickLower, tickUpper] = [tickUpper, tickLower];
    [val0, val1] = [val1, val0];
  }

  const amount0 =
    val0 === 0
      ? MaxUint256
      : JSBI.BigInt(val0 * Math.pow(10, pool.token0.decimals));

  const amount1 =
    val1 === 0
      ? MaxUint256
      : JSBI.BigInt(val1 * Math.pow(10, pool.token1.decimals));

  const pos = Position.fromAmounts({
    pool,
    tickLower,
    tickUpper,
    amount0,
    amount1,
    useFullPrecision: false,
  });

  let newVal0 = parseFloat(pos.amount0.toSignificant(16));
  let newVal1 = parseFloat(pos.amount1.toSignificant(16));

  if (reverse) {
    [newVal0, newVal1] = [newVal1, newVal0];
  }

  return [newVal0, newVal1];
}

function positionDistance(tickCurrent: number, position: { entity: Position }) {
  const { tickLower, tickUpper } = position.entity;
  return tickCurrent - (tickUpper - tickLower) / 2;
}

interface Props {
  baseToken: Token;
  quoteToken: Token;
  initFee: number;
  positions: any[] | null;
  onCancel: () => void;
}

function NewPosition({
  baseToken,
  quoteToken,
  initFee,
  positions,
  onCancel,
}: Props) {
  const { account } = useWeb3React();
  const getTokenBalances = useTokenBalances([baseToken, quoteToken], account);

  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [fee, setFee] = useState<number>(initFee);

  const { pool } = usePool(baseToken, quoteToken, fee);

  const [tickLower, setTickLower] = useState<number>(TickMath.MIN_TICK);
  const [tickUpper, setTickUpper] = useState<number>(TickMath.MIN_TICK);

  const [baseBalance, setBaseBalance] = useState<string>("0");
  const [quoteBalance, setQuoteBalance] = useState<string>("0");

  const [baseTokenDisabled, setBaseTokenDisabled] = useState<boolean>(false);
  const [quoteTokenDisabled, setQuoteTokenDisabled] = useState<boolean>(false);

  useEffect(() => {
    const _run = async () => {
      const [bal0, bal1] = await getTokenBalances();
      setBaseBalance(formatInput(parseFloat(bal0)));
      setQuoteBalance(formatInput(parseFloat(bal1)));
    };
    _run();
  }, [getTokenBalances]);

  const rangeReverse = useMemo(() => {
    if (!quoteToken || !baseToken) {
      return false;
    }

    return baseToken.sortsBefore(quoteToken);
  }, [quoteToken, baseToken]);

  const suggestedTicks = useMemo(() => {
    if (!pool || !positions || !positions.length) {
      return [TickMath.MIN_TICK, TickMath.MIN_TICK];
    }
    const { tickCurrent } = pool;
    let sortedPositions = positions.sort((posA, posB) => {
      const disA = positionDistance(tickCurrent, posA);
      const disB = positionDistance(tickCurrent, posB);
      return disA - disB;
    });

    const { tickLower, tickUpper } = sortedPositions[0].entity;

    if (rangeReverse) {
      return [tickUpper, tickLower];
    }
    return [tickLower, tickUpper];
  }, [pool, positions, rangeReverse]);

  useEffect(() => {
    setTickLower(suggestedTicks[0]);
    setTickUpper(suggestedTicks[1]);
  }, [suggestedTicks]);

  useEffect(() => {
    if (!pool || !baseToken || !quoteToken) {
      return;
    }

    const { tickCurrent } = pool;

    const token0Disabled = tickCurrent > tickUpper;
    const token1Disabled = tickCurrent < tickLower;

    setBaseTokenDisabled(
      pool.token0.equals(baseToken) ? token0Disabled : token1Disabled
    );
    setQuoteTokenDisabled(
      pool.token1.equals(quoteToken) ? token1Disabled : token0Disabled
    );
  }, [pool, tickLower, tickUpper, baseToken, quoteToken]);

  const calculateBaseAndQuoteAmounts = (val0: number, val1: number) => {
    if (!pool) {
      return;
    }

    if (tickLower === TickMath.MIN_TICK || tickUpper === TickMath.MIN_TICK) {
      return;
    }

    if (val0 === 0 && val1 === 0) {
      return;
    }

    const [newQuoteAmount, newBaseAmount] = positionFromAmounts(
      {
        pool,
        tickLower,
        tickUpper,
        val0,
        val1,
      },
      rangeReverse
    );

    setQuoteAmount(newQuoteAmount);
    setBaseAmount(newBaseAmount);
  };

  const tickLowerChange = (value: number) => {
    setTickLower(value);
    calculateBaseAndQuoteAmounts(quoteAmount, baseAmount);
  };

  const tickUpperChange = (value: number) => {
    setTickUpper(value);
    calculateBaseAndQuoteAmounts(quoteAmount, baseAmount);
  };

  const quoteDepositChange = (value: number) => {
    setQuoteAmount(value);
    calculateBaseAndQuoteAmounts(value, 0);
  };

  const baseDepositChange = (value: number) => {
    setBaseAmount(value);
    calculateBaseAndQuoteAmounts(0, value);
  };

  const currentPrice = useMemo(() => {
    if (!pool || !baseToken || !quoteToken) {
      return 0;
    }

    const { tickCurrent } = pool;
    const price = parseFloat(
      tickToPrice(quoteToken, baseToken, tickCurrent).toSignificant(16)
    );

    return formatInput(price);
  }, [pool, baseToken, quoteToken]);

  if (!pool || !baseToken || !quoteToken) {
    return null;
  }

  return (
    <div className="w-1/2">
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
            selected={fee === 500}
            onClick={() => setFee(500)}
            tabIndex={1}
          />
          <FeeButton
            fee={0.3}
            selected={fee === 3000}
            onClick={() => setFee(3000)}
            tabIndex={2}
          />
          <FeeButton
            fee={1}
            selected={fee === 10000}
            onClick={() => setFee(10000)}
            tabIndex={3}
          />
        </div>
      </div>

      <div className="flex flex-col my-2 w-full">
        <div>Range</div>
        <div className="text-sm">
          Current price: <span className="font-bold">{currentPrice}&nbsp;</span>
          <TokenLabel name={baseToken.name} symbol={baseToken.symbol} />
        </div>
        <div className="w-1/3 my-2 flex justify-between">
          <RangeInput
            label="Min"
            initTick={suggestedTicks[0]}
            baseToken={baseToken}
            quoteToken={quoteToken}
            tickSpacing={pool.tickSpacing}
            tabIndex={4}
            reverse={rangeReverse}
            onChange={tickLowerChange}
          />
          <RangeInput
            label="Max"
            initTick={suggestedTicks[1]}
            baseToken={baseToken}
            quoteToken={quoteToken}
            tickSpacing={pool.tickSpacing}
            tabIndex={5}
            reverse={rangeReverse}
            onChange={tickUpperChange}
          />
        </div>
      </div>

      <div className="flex flex-col my-2">
        <div>Deposit</div>
        <div className="w-80 my-2">
          <DepositInput
            token={quoteToken}
            value={quoteAmount}
            balance={quoteBalance}
            tabIndex={7}
            disabled={quoteTokenDisabled}
            onChange={quoteDepositChange}
          />
          <DepositInput
            token={baseToken}
            value={baseAmount}
            balance={baseBalance}
            tabIndex={6}
            disabled={baseTokenDisabled}
            onChange={baseDepositChange}
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
