import { useEffect, useState } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { Pool } from "@uniswap/v3-sdk";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";

import { useV3NFTPositionManagerContract } from "./useContract";

const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1);

export function usePositionFees(
  pool: Pool | null,
  tokenId: BigNumber | null
): [CurrencyAmount<Token>, CurrencyAmount<Token>] | [undefined, undefined] {
  const [tokenOwner, setTokenOwner] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<[BigNumber, BigNumber]>();

  const positionManager = useV3NFTPositionManagerContract();

  useEffect(() => {
    const getOwner = async () => {
      if (!positionManager || !tokenId) {
        return;
      }
      const result = await positionManager.functions.ownerOf(tokenId);
      setTokenOwner(result[0]);
    };
    getOwner();
  }, [positionManager, tokenId]);

  useEffect(() => {
    const callCollect = async () => {
      if (!positionManager || !tokenId || !tokenOwner) {
        return;
      }
      const result = await positionManager.callStatic.collect(
        {
          tokenId: tokenId.toHexString(),
          recipient: tokenOwner,
          amount0Max: MAX_UINT128,
          amount1Max: MAX_UINT128,
        },
        { from: tokenOwner }
      );
      setAmounts([result.amount0, result.amount1]);
    };

    callCollect();
  }, [tokenOwner, tokenId, positionManager]);

  if (pool && amounts) {
    return [
      CurrencyAmount.fromRawAmount(pool.token0, amounts[0].toString()),
      CurrencyAmount.fromRawAmount(pool.token1, amounts[1].toString()),
    ];
  } else {
    return [undefined, undefined];
  }
}
