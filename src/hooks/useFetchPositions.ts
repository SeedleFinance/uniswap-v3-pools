import { useState, useEffect } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

import { TxTypes } from '../enums';

export interface TransactionV2 {
  tokenId: number;
  amount0: string;
  amount1: string;
  transactionType: number;
  liquidity: string;
  transactionHash: string;
  timestamp: string;
  gas: string;
  gasPrice: string;
}

export interface PositionStateV2 {
  positionId: number;
  tickLower: number;
  tickUpper: number;
  poolAddress: string;
  owner: string;
  positionLiquidity: BigNumber;
  transactions: TransactionV2[];
}

export interface PoolStateV2 {
  address: string;
  tickSpacing: number;
  fee: number;
  token0: any;
  token1: any;
  sqrtPriceX96: string;
  liquidity: string;
  tick: number;
}

export function useFetchPositions(
  chainId: number,
  addresses: string[],
): { loading: boolean; positionStates: PositionStateV2[] } {
  const [loading, setLoading] = useState(true);
  const [positionStates, setPositionStates] = useState([]);

  useEffect(() => {
    const _call = async () => {
      const url = 'https://ql2p37n7rb.execute-api.us-east-2.amazonaws.com/positions';
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ chainId, addresses }),
      });
      if (!res.ok) {
        return;
      }

      const results = await res.json();

      const positions = [];
      results.forEach((resultsByAddress: any[], idx: number) => {
        resultsByAddress.forEach((result: any) => {
          // calculate position liquidity
          let positionLiquidity = BigNumber.from(0);
          result.transactions.forEach(({ transactionType, liquidity }) => {
            if (transactionType === TxTypes.Add) {
              positionLiquidity = positionLiquidity.add(BigNumber.from(liquidity));
            } else if (transactionType === TxTypes.Remove) {
              positionLiquidity = positionLiquidity.sub(BigNumber.from(liquidity));
            }
          });

          // TODO: calculate uncollected fees
          let uncollectedFees = BigNumber.from(0);

          positions.push({
            ...result,
            liquidity: positionLiquidity,
            uncollectedFees,
            owner: addresses[idx],
          });
        });
      });

      setPositionStates(positions);
      setLoading(false);
    };

    if (addresses.length) {
      _call();
    }
  }, [chainId, addresses]);

  return { loading, positionStates };
}

export function useFetchPools(
  chainId: number,
  addresses: string[],
): { loading: boolean; poolStates: PoolStateV2[] } {
  const [loading, setLoading] = useState(true);
  const [poolStates, setPoolStates] = useState([]);

  useEffect(() => {
    const _call = async () => {
      const url = 'https://ql2p37n7rb.execute-api.us-east-2.amazonaws.com/pools';
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ chainId, addresses }),
      });
      if (!res.ok) {
        return;
      }

      const pools = await res.json();

      setPoolStates(pools);
      setLoading(false);
    };

    if (addresses.length) {
      _call();
    }
  }, [chainId, addresses]);

  return { loading, poolStates };
}
