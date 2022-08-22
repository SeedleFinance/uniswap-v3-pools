import { useState, useEffect } from 'react';
import { uniqBy } from 'lodash';
import { BigNumber } from '@ethersproject/bignumber';

import { TxTypes } from '../enums';

export interface TransactionV2 {
  id: string;
  tokenId: number;
  amount0: string;
  amount1: string;
  transactionType: number;
  liquidity: string;
  transactionHash: string;
  timestamp: string;
  gas?: string;
  gasPrice?: string;
  gasUsed?: string;
  effectiveGasPrice?: string;
  l1Fee?: string;
}

export interface PositionStateV2 {
  positionId: number;
  tickLower: number;
  tickUpper: number;
  pool: string;
  owner: string;
  liquidity: BigNumber;
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

interface UncollectedFeesInputPosition {
  tokenId: number;
  tickLower: number;
  tickUpper: number;
}

interface UncollectedFeesInput {
  address: string;
  currentTick: number;
  positions: UncollectedFeesInputPosition[];
}

interface UncollectedFeesResult {
  tokenId: number;
  amount0: number;
  amount1: number;
}

export function useFetchPositions(
  chainId: number,
  addresses: string[],
  timestamp: number,
): { loading: boolean; positionStates: PositionStateV2[] } {
  const [loading, setLoading] = useState(true);
  const [positionStates, setPositionStates] = useState<PositionStateV2[]>([]);

  useEffect(() => {
    const _call = async () => {
      setLoading(true);

      const url = 'https://ql2p37n7rb.execute-api.us-east-2.amazonaws.com/positions';
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ chainId, addresses, timestamp }),
      });
      if (!res.ok) {
        const errors = await res.json();
        console.error(errors);
        setPositionStates([]);
        setLoading(false);
        return;
      }

      const results = await res.json();

      const positions: PositionStateV2[] = [];
      results.forEach((resultsByAddress: any[], idx: number) => {
        resultsByAddress.forEach((result: any) => {
          // calculate position liquidity
          let positionLiquidity = BigNumber.from(0);
          // remove duplicate transactions
          const txs = uniqBy(result.transactions, 'id');
          txs.forEach(({ transactionType, liquidity }: any) => {
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
            transactions: txs,
            liquidity: positionLiquidity,
            uncollectedFees,
            owner: addresses[idx],
          });
        });
      });

      setPositionStates(positions);
      setLoading(false);
    };

    if (!addresses.length) {
      setLoading(false);
      setPositionStates([]);

      return;
    }

    _call();
  }, [chainId, addresses, timestamp]);

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
      setLoading(true);

      const url = 'https://ql2p37n7rb.execute-api.us-east-2.amazonaws.com/pools';
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ chainId, addresses }),
      });
      if (!res.ok) {
        const errors = await res.json();
        console.error(errors);
        setPoolStates([]);
        setLoading(false);

        return;
      }

      let pools = await res.json();
      // Pools should not be null (null pools are usually a result of data indexing error)
      // however there can be pools without any liquidity - we'd filter them out
      pools = pools.filter(
        (pool: any) => pool && pool.liquidity.length && pool.sqrtPriceX96.length,
      );

      setPoolStates(pools);
      setLoading(false);
    };

    if (!addresses.length) {
      setPoolStates([]);
      setLoading(false);

      return;
    }

    _call();
  }, [chainId, addresses]);

  return { loading, poolStates };
}

export function useFetchUncollectedFees(
  chainId: number,
  pools: UncollectedFeesInput[],
): { loading: boolean; uncollectedFees: UncollectedFeesResult[][] } {
  const [loading, setLoading] = useState(true);
  const [uncollectedFees, setUncollectedFees] = useState([]);

  useEffect(() => {
    const _call = async () => {
      setLoading(true);

      const url = 'https://ql2p37n7rb.execute-api.us-east-2.amazonaws.com/fees';
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ chainId, pools }),
      });
      if (!res.ok) {
        const errors = await res.json();
        console.error(errors);
        setUncollectedFees([]);
        setLoading(false);

        return;
      }

      const results = await res.json();

      setUncollectedFees(results);
      setLoading(false);
    };

    if (!pools.length) {
      setUncollectedFees([]);
      setLoading(false);

      return;
    }

    _call();
  }, [chainId, pools]);

  return { loading, uncollectedFees };
}

export function useFetchPriceFeed(
  chainId: number,
  tokens: string[],
): { loading: boolean; priceFeed: { [pool: string]: number } } {
  const [loading, setLoading] = useState(true);
  const [priceFeedResult, setPriceFeedResult] = useState({});

  useEffect(() => {
    const _call = async () => {
      setLoading(true);

      const url = 'https://ql2p37n7rb.execute-api.us-east-2.amazonaws.com/prices';
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ chainId, tokens }),
      });
      if (!res.ok) {
        const errors = await res.json();
        console.error(errors);
        setPriceFeedResult({});
        setLoading(false);

        return;
      }

      const results = await res.json();

      setPriceFeedResult(results);
      setLoading(false);
    };

    if (!tokens || !tokens.length) {
      setPriceFeedResult([]);
      setLoading(false);
    }

    _call();
  }, [chainId, tokens]);

  return { loading, priceFeed: priceFeedResult };
}
