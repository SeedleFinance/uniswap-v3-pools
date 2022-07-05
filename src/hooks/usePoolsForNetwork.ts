import { useMemo } from 'react';
import { Token, CurrencyAmount } from '@uniswap/sdk-core';
import { Position, Pool, tickToPrice } from '@uniswap/v3-sdk';
import { BigNumber } from '@ethersproject/bignumber';

import { useAppSettings } from '../AppSettingsProvider';
import { useAddress } from '../AddressProvider';
import { getQuoteAndBaseToken } from '../utils/tokens';
import { calcGasCost } from '../utils/gas';
import { TxTypes } from '../enums';

import {
  useFetchPositions,
  useFetchPools,
  useFetchUncollectedFees,
  PositionStateV2,
  TransactionV2,
} from './fetch';

function reconcileTransactions(chainId: number, txs: any[]) {
  let prevRemoveTx: TransactionV2 | null = null;
  // we need to reconcile collects with corresponding removes to adjust the liquidity.
  return txs.map((tx) => {
    if (tx.transactionType === TxTypes.Remove) {
      prevRemoveTx = tx;
      return tx;
    } else if (
      prevRemoveTx &&
      tx.transactionType === TxTypes.Collect &&
      prevRemoveTx.timestamp === tx.timestamp
    ) {
      return {
        ...tx,
        amount0: tx.amount0.subtract(prevRemoveTx.amount0),
        amount1: tx.amount1.subtract(prevRemoveTx.amount1),
        gas: calcGasCost(chainId, '0', '0'),
      };
    } else {
      return tx;
    }
  });
}

export function usePoolsForNetwork(chainId: number, timestamp: number, noFilterClosed = false) {
  const { filterClosed } = useAppSettings();
  const { addresses } = useAddress();

  const { loading: queryLoading, positionStates: allPositions } = useFetchPositions(
    chainId,
    addresses,
    timestamp,
  );

  const positionsByPool = useMemo((): {
    [key: string]: PositionStateV2[];
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

  const uncollectedFeesParams = useMemo(() => {
    if (!pools.length || !Object.keys(positionsByPool).length) {
      return [];
    }
    return pools
      .map(({ address, tick }) => {
        const positions = positionsByPool[address.toLowerCase()]
          .filter(({ liquidity }) => !liquidity.isZero())
          .map(({ tickLower, tickUpper, positionId, liquidity }) => {
            return { tokenId: positionId, tickLower, tickUpper };
          });
        return { address, currentTick: tick, positions };
      })
      .filter(({ positions }) => positions.length);
  }, [pools, positionsByPool]);

  const { loading: feesLoading, uncollectedFees } = useFetchUncollectedFees(
    chainId,
    uncollectedFeesParams,
  );

  const uncollectedFeesByTokenId = useMemo(() => {
    if (!uncollectedFees || feesLoading) {
      return [];
    }
    const fees: { [id: number]: number[] } = {};
    uncollectedFees.flat().forEach(({ tokenId, amount0, amount1 }) => {
      fees[tokenId] = [amount0, amount1];
    });
    return fees;
  }, [uncollectedFees, feesLoading]);

  const poolsWithPositions = useMemo(() => {
    if (!pools.length || !Object.keys(positionsByPool).length) {
      return [];
    }

    return pools
      .map((pool) => {
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

        const positions = positionsByPool[pool.address.toLowerCase()]
          .filter(({ liquidity }) => (filterClosed ? !liquidity.isZero() : true))
          .map(({ positionId, liquidity, tickLower, tickUpper, transactions }) => {
            if (!liquidity || !tickLower || !tickUpper) {
              return null;
            }

            const positionEntity = new Position({
              pool: entity,
              liquidity: liquidity.toString(),
              tickLower,
              tickUpper,
            });
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

            const rawUncollectedFees = uncollectedFeesByTokenId[positionId] || ['0', '0'];
            const uncollectedFees = [
              CurrencyAmount.fromRawAmount(entity.token0, rawUncollectedFees[0]),
              CurrencyAmount.fromRawAmount(entity.token1, rawUncollectedFees[1]),
            ];

            const positionUncollectedFees = entity.token0.equals(baseToken)
              ? entity.priceOf(entity.token1).quote(uncollectedFees[1]).add(uncollectedFees[0])
              : entity.priceOf(entity.token0).quote(uncollectedFees[0]).add(uncollectedFees[1]);

            poolUncollectedFees = poolUncollectedFees.add(positionUncollectedFees);

            let formattedTransactions = transactions
              .filter(({ transactionType }) => transactionType !== TxTypes.Transfer)
              .map(
                ({
                  transactionHash,
                  transactionType,
                  amount0,
                  amount1,
                  gas,
                  gasPrice,
                  timestamp,
                }: TransactionV2) => {
                  return {
                    id: transactionHash,
                    transactionType,
                    timestamp: BigNumber.from(timestamp || '0x60d953c7').toNumber(),
                    amount0: CurrencyAmount.fromRawAmount(token0, amount0),
                    amount1: CurrencyAmount.fromRawAmount(token1, amount1),
                    gas: gas ? calcGasCost(chainId, gas, gasPrice) : calcGasCost(chainId, '0', '0'),
                  };
                },
              )
              .sort((a, b) => a.timestamp - b.timestamp);
            formattedTransactions = reconcileTransactions(chainId, formattedTransactions);

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
          })
          .filter((position) => position !== null);

        return {
          ...pool,
          key: pool.address,
          address: pool.address.toLowerCase(),
          entity,
          baseToken,
          quoteToken,
          rawPoolLiquidity,
          poolLiquidity,
          poolUncollectedFees,
          positions,
        };
      })
      .filter(({ positions }) => (filterClosed ? positions.length > 0 : true));
  }, [pools, positionsByPool, uncollectedFeesByTokenId, filterClosed, chainId]);

  return { loading: queryLoading || poolsLoading, pools: poolsWithPositions };
}
