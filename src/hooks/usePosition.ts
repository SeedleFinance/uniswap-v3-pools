import { useEffect, useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

import { useV3NFTPositionManagerContract } from './useContract';
const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1);

export interface PositionState {
  id: BigNumber;
  token0address: string;
  token1address: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: BigNumber;
  fees: { amount0: BigNumber; amount1: BigNumber };
}

export function useAllPositions(account: string | null | undefined): PositionState[] {
  const contract = useV3NFTPositionManagerContract();
  const [positions, setPositions] = useState<PositionState[]>([]);

  useEffect(() => {
    const collectPositions = async (account: string, balance: number): Promise<PositionState[]> => {
      const results: PositionState[] = [];

      const _collect = async (idx: number): Promise<PositionState[]> => {
        if (contract && idx !== -1) {
          const tokIdResult = await contract.functions.tokenOfOwnerByIndex(account, idx);
          const result = await contract.functions.positions(tokIdResult[0]);
          const liquidity = result[7];

          let fees = { amount0: BigNumber.from(0), amount1: BigNumber.from(0) };
          try {
            if (!liquidity.isZero()) {
              fees = await contract.callStatic.collect(
                {
                  tokenId: tokIdResult[0],
                  recipient: account,
                  amount0Max: MAX_UINT128,
                  amount1Max: MAX_UINT128,
                },
                { from: account },
              );
            }
          } catch (e) {
            console.error(e);
            fees = { amount0: BigNumber.from(0), amount1: BigNumber.from(0) };
          }

          const position = {
            id: tokIdResult[0],
            token0address: result[2],
            token1address: result[3],
            fee: result[4],
            tickLower: result[5],
            tickUpper: result[6],
            liquidity,
            fees,
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

  return positions;
}
