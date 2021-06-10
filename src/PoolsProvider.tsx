import React, { ReactNode, useContext, useMemo } from "react";
import { uniq } from "lodash";

import { useAllPositions, PositionState } from "./hooks/usePosition";
import { usePoolContracts, PoolParams } from "./hooks/useContract";
import { useTokens } from "./hooks/useToken";
import { usePoolsState, PoolState } from "./hooks/usePool";

const PoolsContext = React.createContext({ pools: [] as PoolState[] });
export const usePools = () => useContext(PoolsContext);

interface Props {
  children: ReactNode;
  account: string | null | undefined;
}

export const PoolsProvider = ({ account, children }: Props) => {
  const allPositions = useAllPositions(account);

  const tokenAddresses = useMemo(() => {
    if (!allPositions.length) {
      return [];
    }

    return uniq(
      allPositions.reduce((accm: string[], position: any) => {
        return [...accm, position.token0address, position.token1address];
      }, [])
    );
  }, [allPositions]);

  const tokens = useTokens(tokenAddresses);

  const { poolParams, positionsByPool } = useMemo((): {
    poolParams: PoolParams[];
    positionsByPool: {
      [key: string]: PositionState[];
    };
  } => {
    if (!allPositions.length && !tokens.length) {
      return { poolParams: [], positionsByPool: {} };
    }

    const positionsByPool: { [key: string]: PositionState[] } = {};
    const poolParamsObj = allPositions.reduce(
      (accm: { [index: string]: any }, position) => {
        const key = `${position.token0address}-${position.token1address}-${position.fee}`;

        // add position to pool
        const collection = positionsByPool[key] || [];
        positionsByPool[key] = [...collection, position];

        accm[key] = {
          key,
          token0: tokens[position.token0address],
          token1: tokens[position.token1address],
          fee: position.fee,
        };

        return accm;
      },
      {}
    );

    return { poolParams: Object.values(poolParamsObj), positionsByPool };
  }, [allPositions, tokens]);

  const poolContracts = usePoolContracts(poolParams);

  const pools = usePoolsState(poolContracts, poolParams, positionsByPool);

  return (
    <PoolsContext.Provider value={{ pools }}>{children}</PoolsContext.Provider>
  );
};
