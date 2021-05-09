import React, { useMemo } from "react";
import { BigNumber } from "@ethersproject/bignumber";

import { useToken } from "./hooks/useToken";
import { usePool } from "./hooks/usePool";
import { usePosition } from "./hooks/usePosition";
import { usePositionFees } from "./hooks/usePositionFees";

import Token from "./Token";

export interface PositionProps {
  id: BigNumber;
  token0address: string;
  token1address: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: BigNumber;
  feeGrowthInside0LastX128: BigNumber;
  feeGrowthInside1LastX128: BigNumber;
  tokensOwed0: BigNumber;
  tokensOwed1: BigNumber;
}

function Position({
  id,
  token0address,
  token1address,
  fee,
  tickLower,
  tickUpper,
  liquidity,
  feeGrowthInside0LastX128,
  feeGrowthInside1LastX128,
  tokensOwed0,
  tokensOwed1,
}: PositionProps) {
  const token0 = useToken(token0address);
  const token1 = useToken(token1address);

  const pool = usePool(token0, token1, fee);

  const position = usePosition(
    pool,
    liquidity.toString(),
    tickLower,
    tickUpper
  );

  const uncollectedFees = usePositionFees(pool, id);

  const isInRange = useMemo(() => {
    if (!pool) {
      return false;
    }
    return tickLower < pool.tickCurrent && tickUpper > pool.tickCurrent;
  }, [pool, tickLower, tickUpper]);

  if (!token0 || !token1 || !pool || !position) {
    return null;
  }

  return (
    <div className="mx-2 my-4">
      <div>Id: {id.toString()}</div>
      <div>
        Token0: <Token name={token0.name} symbol={token0.symbol} />
      </div>
      <div>
        Token1: <Token name={token1.name} symbol={token1.symbol} />
      </div>
      <div>Fee: {fee / 10000}</div>
      <div>
        Range: {position.token0PriceLower.toFixed()} -{" "}
        {position.token0PriceUpper.toFixed()}
      </div>
      <div>Token0 Price: {pool.token0Price.toFixed()}</div>
      <div>Token1 Price: {pool.token1Price.toFixed()}</div>
      <div>Amount 0: {position.amount0.toFixed(4)}</div>
      <div>Amount 1: {position.amount1.toFixed(4)}</div>
      <div>Uncollected Fees (token 0): {uncollectedFees[0]?.toFixed()}</div>
      <div>Uncollected Fees (token 1): {uncollectedFees[1]?.toFixed()}</div>
      <div>{isInRange ? "In Range" : "Out of Range"}</div>
    </div>
  );
}

export default Position;
