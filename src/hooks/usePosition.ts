import { useMemo } from "react";
import { Position, Pool } from "@uniswap/v3-sdk";

export function usePosition(
  pool: Pool | null,
  liquidity: string,
  tickLower: number,
  tickUpper: number
): Position | null {
  return useMemo(() => {
    if (!pool) {
      return null;
    }
    return new Position({ pool, liquidity, tickLower, tickUpper });
  }, [pool, liquidity, tickLower, tickUpper]);
}
