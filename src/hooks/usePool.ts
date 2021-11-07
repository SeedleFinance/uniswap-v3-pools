import { useState, useEffect } from "react";
import { Pool } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";

import { usePoolContract } from "./useContract";

export function usePool(
  token0: Token | null,
  token1: Token | null,
  fee: number
): {
  pool: Pool | null;
  poolAddress: string | null;
} {
  const contract = usePoolContract(token0, token1, fee);

  const [pool, setPool] = useState<Pool | null>(null);
  const [poolAddress, setPoolAddress] = useState<string | null>(null);

  useEffect(() => {
    const call = async () => {
      if (!contract) {
        return;
      }

      setPoolAddress(contract.address.toLowerCase());

      const result = await contract.functions.slot0();
      const sqrtPriceX96 = result[0];
      const tickCurrent = result[1];

      const liquidityResult = await contract.functions.liquidity();
      const liquidity = liquidityResult[0];

      setPool(
        new Pool(
          token0 as Token,
          token1 as Token,
          fee,
          sqrtPriceX96,
          liquidity,
          tickCurrent
        )
      );
    };

    call();
  }, [contract, token0, token1, fee]);

  return { pool, poolAddress };
}
