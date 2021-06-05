import { useEffect, useMemo, useState } from "react";
import { Position, Pool } from "@uniswap/v3-sdk";
import { BigNumber } from "@ethersproject/bignumber";

import { useV3NFTPositionManagerContract } from "./useContract";

export interface PositionState {
  id: BigNumber;
  token0address: string;
  token1address: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: BigNumber;
}

export interface PoolState {
  key: string;
  token0address: string;
  token1address: string;
  fee: number;
  liquidity: BigNumber;
  positions: {
    id: BigNumber;
    tickLower: number;
    tickUpper: number;
    liquidity: BigNumber;
  }[];
}

export function usePositionsByPools(account: string | null | undefined) {
  const contract = useV3NFTPositionManagerContract();
  const [positions, setPositions] = useState<PositionState[]>([]);

  useEffect(() => {
    const collectPositions = async (
      account: string,
      balance: number
    ): Promise<PositionState[]> => {
      const results: PositionState[] = [];

      const _collect = async (idx: number): Promise<PositionState[]> => {
        if (contract && idx !== -1) {
          const tokIdResult = await contract.functions.tokenOfOwnerByIndex(
            account,
            idx
          );
          const result = await contract.functions.positions(tokIdResult[0]);
          const position = {
            id: tokIdResult[0],
            token0address: result[2],
            token1address: result[3],
            fee: result[4],
            tickLower: result[5],
            tickUpper: result[6],
            liquidity: result[7],
          };
          results.push(position);
          return _collect(idx - 1);
        } else {
          return results;
        }
      };

      return _collect(balance - 1);
    };

    const _run = async () => {
      if (!account || !contract) {
        return;
      }
      const balance = await contract.balanceOf(account);
      if (balance.isZero()) {
        setPositions([]);
        return;
      }
      const results = await collectPositions(account, balance.toNumber());
      setPositions(results);
    };

    if (!account) {
      return;
    }

    _run();
  }, [account, contract]);

  const pools = useMemo(() => {
    if (!positions.length) {
      return [];
    }

    const poolsUnsorted = positions.reduce(
      (accm: { [index: string]: PoolState }, pos: PositionState) => {
        const key = `${pos.token0address}-${pos.token1address}-${pos.fee}`;
        const currentPositions = accm[key] ? accm[key].positions : [];
        const liquidity = accm[key] ? accm[key].liquidity : BigNumber.from(0);
        accm[key] = {
          key,
          token0address: pos.token0address,
          token1address: pos.token1address,
          fee: pos.fee,
          liquidity: liquidity.add(pos.liquidity),
          positions: [
            ...currentPositions,
            {
              id: pos.id,
              tickLower: pos.tickLower,
              tickUpper: pos.tickUpper,
              liquidity: pos.liquidity,
            },
          ],
        };
        return accm;
      },
      {}
    );
    return Object.keys(poolsUnsorted)
      .sort((a, b) =>
        poolsUnsorted[a].liquidity.gte(poolsUnsorted[b].liquidity) ? -1 : 1
      )
      .map((key) => poolsUnsorted[key]);
  }, [positions]);

  return pools;
}

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
