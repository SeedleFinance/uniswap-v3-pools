import { useMemo } from 'react';
import { Token, CurrencyAmount } from '@uniswap/sdk-core';
import { Position, Pool, tickToPrice } from '@uniswap/v3-sdk';
import { BigNumber } from '@ethersproject/bignumber';

import { useAddress } from '../providers/AddressProvider';
import { getQuoteAndBaseToken } from '../utils/tokens';
import { calcGasCost } from '../utils/gas';
import { TxTypes } from '../types/enums';

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

// set `onlyForInjected`to return pools owned by connected wallet
export function usePoolsForNetwork(chainId: number, timestamp: number, onlyForInjected = false) {
  const { addresses: inputAddresses, injectedAddress } = useAddress();

  const { loading: queryLoading, positionStates: allPositions } = useFetchPositions(
    chainId,
    onlyForInjected ? [injectedAddress] : inputAddresses,
    timestamp,
  );

  const positionsByPool = useMemo((): {
    [key: string]: PositionStateV2[];
  } => {
    if (queryLoading || !allPositions.length) {
      return {};
    }
    const positionsByPool: { [key: string]: PositionStateV2[] } = {};

    allPositions.forEach((position) => {
      if (!position) {
        return;
      }

      const { pool } = position;
      if (!pool) {
        console.error('no pool defined', { chainId, position });
        return;
      }

      const collection = positionsByPool[pool] || [];
      collection.push(position);
      positionsByPool[pool] = collection;
    });

    return positionsByPool;
  }, [queryLoading, allPositions, chainId]);

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
      let rawPoolUncollectedFees = [BigNumber.from(0), BigNumber.from(0)];
      let poolUncollectedFees = CurrencyAmount.fromRawAmount(baseToken, 0);

      const positions = positionsByPool[pool.address.toLowerCase()]
        .sort((a, b) => (b.liquidity.gte(a.liquidity) ? 1 : -1))
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

          rawPoolUncollectedFees = [
            rawPoolUncollectedFees[0].add(BigNumber.from(rawUncollectedFees[0])),
            rawPoolUncollectedFees[1].add(BigNumber.from(rawUncollectedFees[1])),
          ];
          poolUncollectedFees = poolUncollectedFees.add(positionUncollectedFees);

          let formattedTransactions = transactions
            .filter(({ transactionType }) => transactionType !== TxTypes.Transfer)
            .map(
              ({
                id,
                transactionHash,
                transactionType,
                amount0,
                amount1,
                gas,
                gasUsed,
                gasPrice,
                effectiveGasPrice,
                l1Fee,
                timestamp,
              }: TransactionV2) => {
                return {
                  id,
                  transactionHash,
                  transactionType,
                  timestamp: BigNumber.from(timestamp || '0').toNumber(),
                  amount0: CurrencyAmount.fromRawAmount(token0, amount0),
                  amount1: CurrencyAmount.fromRawAmount(token1, amount1),
                  gas: calcGasCost(
                    chainId,
                    gasUsed || gas || '0',
                    effectiveGasPrice || gasPrice || '0',
                    l1Fee,
                  ),
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

      const currencyPoolUncollectedFees = [
        CurrencyAmount.fromRawAmount(entity.token0, rawPoolUncollectedFees[0].toString()),
        CurrencyAmount.fromRawAmount(entity.token1, rawPoolUncollectedFees[1].toString()),
      ];

      const currentPrice = parseFloat(
        tickToPrice(quoteToken, baseToken, entity.tickCurrent).toSignificant(8),
      );

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
        currencyPoolUncollectedFees,
        currentPrice,
        positions,
      };
    });
  }, [pools, positionsByPool, uncollectedFeesByTokenId, chainId]);

  return {
    loading: queryLoading || poolsLoading,
    feesLoading,
    pools: poolsWithPositions,
  };
}
