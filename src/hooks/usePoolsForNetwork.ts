import { useEffect, useMemo } from 'react';
import { Token, CurrencyAmount } from '@uniswap/sdk-core';
import { Position, Pool, tickToPrice } from '@uniswap/v3-sdk';
import { BigNumber } from '@ethersproject/bignumber';

import { useAppSettings } from '../AppSettingsProvider';
import { useAddress } from '../AddressProvider';
import { getQuoteAndBaseToken } from '../utils/tokens';
import { calcGasCost } from '../utils/gas';

import {
  useFetchPositions,
  useFetchPools,
  PositionStateV2,
  PoolStateV2,
  TransactionV2,
} from './useFetchPositions';

export function usePoolsForNetwork(chainId: number, noFilterClosed = false) {
  const { filterClosed } = useAppSettings();
  const { addresses } = useAddress();

  const { loading: queryLoading, positionStates: allPositions } = useFetchPositions(
    chainId,
    addresses,
  );

  const positionsByPool = useMemo((): {
    [key: string]: PositionState[];
  } => {
    if (!allPositions.length) {
      return {};
    }
    const positionsByPool: { [key: string]: PositionStateV2[] } = {};

    allPositions.forEach((position) => {
      if (!position) {
        return;
      }

      const { pool } = position;
      if (!pool) {
        console.log('no pool defined', position);
        return;
      }

      const collection = positionsByPool[pool] || [];
      collection.push(position);
      positionsByPool[pool] = collection;
    });

    return positionsByPool;
  }, [allPositions]);

  const poolAddresses = useMemo(() => Object.keys(positionsByPool), [positionsByPool]);
  const { loading: poolsLoading, poolStates: pools } = useFetchPools(chainId, poolAddresses);

  const poolsWithPositions = useMemo(() => {
    return pools.map((pool) => {
      const token0 = new Token(
        chainId,
        pool.token0.address,
        parseInt(pool.token0.decimals, 10),
        pool.token0.symbol,
        pool.token0.name,
      );
      const token1 = new Token(
        chainId,
        pool.token1.address,
        parseInt(pool.token1.decimals, 10),
        pool.token1.symbol,
        pool.token1.name,
      );
      const entity = new Pool(
        token0,
        token1,
        pool.fee,
        pool.sqrtPriceX96,
        pool.liquidity,
        pool.tick,
      );

      const [quoteToken, baseToken] = getQuoteAndBaseToken(chainId, entity.token0, entity.token1);

      let rawPoolLiquidity = BigNumber.from(0);
      let poolLiquidity = CurrencyAmount.fromRawAmount(baseToken, 0);
      let poolUncollectedFees = CurrencyAmount.fromRawAmount(baseToken, 0);

      const positions = positionsByPool[pool.address.toLowerCase()].map(
        ({ positionId, liquidity, tickLower, tickUpper, transactions }) => {
          if (!liquidity || !tickLower || !tickUpper) {
            return null;
          }

          const positionEntity = new Position({ pool: entity, liquidity, tickLower, tickUpper });
          const priceLower = tickToPrice(quoteToken, baseToken, tickLower);
          const priceUpper = tickToPrice(quoteToken, baseToken, tickUpper);

          rawPoolLiquidity = rawPoolLiquidity.add(liquidity);

          const positionLiquidity = entity.token0.equals(baseToken)
            ? entity
                .priceOf(entity.token1)
                .quote(positionEntity.amount1)
                .add(positionEntity.amount0)
            : entity
                .priceOf(entity.token0)
                .quote(positionEntity.amount0)
                .add(positionEntity.amount1);

          poolLiquidity = poolLiquidity.add(positionLiquidity);

          const uncollectedFees = [
            CurrencyAmount.fromRawAmount(entity.token0, '0'),
            CurrencyAmount.fromRawAmount(entity.token1, '0'),
          ];

          const positionUncollectedFees = entity.token0.equals(baseToken)
            ? entity.priceOf(entity.token1).quote(uncollectedFees[1]).add(uncollectedFees[0])
            : entity.priceOf(entity.token0).quote(uncollectedFees[0]).add(uncollectedFees[1]);

          poolUncollectedFees = poolUncollectedFees.add(positionUncollectedFees);

          const formattedTransactions = transactions
            .map(
              ({ transactionType, amount0, amount1, gas, gasPrice, timestamp }: TransactionV2) => {
                return {
                  transactionType,
                  timestamp: BigNumber.from(timestamp).toNumber(),
                  amount0: CurrencyAmount.fromRawAmount(token0, BigNumber.from(amount0)),
                  amount1: CurrencyAmount.fromRawAmount(token1, BigNumber.from(amount1)),
                  gas: calcGasCost(chainId, gas, gasPrice),
                };
              },
            )
            .sort((a, b) => a.timestamp - b.timestamp);

          return {
            id: positionId,
            entity: positionEntity,
            priceLower,
            priceUpper,
            positionLiquidity,
            uncollectedFees,
            positionUncollectedFees,
            transactions: formattedTransactions,
          };
        },
      );

      return {
        ...pool,
        entity,
        baseToken,
        quoteToken,
        rawPoolLiquidity,
        poolLiquidity,
        poolUncollectedFees,
        positions,
      };
    });
  }, [pools, positionsByPool]);

  return { loading: queryLoading || poolsLoading, pools: poolsWithPositions };
}
