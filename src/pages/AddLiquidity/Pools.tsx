import React, { useMemo } from "react";
import { Token } from "@uniswap/sdk-core";

import { PoolState } from "../../hooks/usePool";
import PoolButton from "../../ui/PoolButton";

interface Props {
  pools: PoolState[];
  filter: string;
  onPoolClick: (
    baseToken: Token,
    quoteToken: Token,
    fee: number,
    positions: any[]
  ) => void;
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
      if (
        a0.includes(c) ||
        a1.includes(c) ||
        b0.includes(c) ||
        b1.includes(c)
      ) {
        return true;
      }

      return false;
    });
  }, [pools, filter]);

  if (!pools.length) {
    return <div>Loading pools...</div>;
  }

  return (
    <div className="w-full flex flex-wrap">
      {filteredPools
        .slice(0, 19)
        .map(({ key, baseToken, quoteToken, entity, positions }: PoolState) => (
          <div
            key={key}
            className="w-80 border border-gray-400 rounded my-3 mr-3 p-3 text-lg"
          >
            <PoolButton
              baseToken={baseToken}
              quoteToken={quoteToken}
              fee={entity.fee / 10000}
              onClick={() =>
                onPoolClick(baseToken, quoteToken, entity.fee, positions)
              }
            />
          </div>
        ))}
    </div>
  );
}

export default Pools;
