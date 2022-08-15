import React, { useMemo } from 'react';
import { Token } from '@uniswap/sdk-core';

import { PoolState } from '../../types/seedle';
import PoolButton from '../../ui/PoolButton';
import LoadingSpinner from '../../ui/Spinner';

interface Props {
  pools: PoolState[];
  filter: string;
  onPoolClick: (baseToken: Token, quoteToken: Token, fee: number, positions: any[]) => void;
}

function Pools({ pools, onPoolClick, filter }: Props) {
  const filteredPools = useMemo(() => {
    if (filter.length < 2) {
      return pools;
    }

    if (!pools.length) {
      return pools;
    }

    return pools.filter(({ baseToken, quoteToken }: PoolState) => {
      const a0 = baseToken.name!.toLowerCase();
      const a1 = baseToken.symbol!.toLowerCase();
      const b0 = quoteToken.name!.toLowerCase();
      const b1 = quoteToken.symbol!.toLowerCase();
      const c = filter.toLowerCase();
      if (a0.includes(c) || a1.includes(c) || b0.includes(c) || b1.includes(c)) {
        return true;
      }

      return false;
    });
  }, [pools, filter]);

  if (!pools.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full flex flex-wrap">
      {filteredPools
        .slice(0, 19)
        .map(({ key, baseToken, quoteToken, entity, positions }: PoolState) => (
          <div
            key={key}
            className="w-80 border border-slate-200 dark:border-slate-700 rounded my-3 mr-3 p-3 text-lg text-slate-600 dark:text-slate-300"
          >
            <PoolButton
              baseToken={baseToken}
              quoteToken={quoteToken}
              fee={entity.fee / 10000}
              onClick={() => onPoolClick(baseToken, quoteToken, entity.fee, positions)}
            />
          </div>
        ))}
    </div>
  );
}

export default Pools;
