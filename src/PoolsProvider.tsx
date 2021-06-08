import React, { ReactNode, useEffect, useState, useContext } from "react";

import { useAllPositions, PositionState } from "./hooks/usePosition";
import { usePoolContracts } from "./hooks/useContract";

const PoolsContext = React.createContext({});
export const usePools = () => useContext(PoolsContext);

interface Props {
  children: ReactNode;
  account: string | null | undefined;
}

export const PoolsProvider = ({ account, children }: Props) => {
  const allPositions = useAllPositions(account);

  const [poolParams, setPoolParams] = useState<any[]>([]);
  const poolContracts = usePoolContracts(poolParams);

  const [pools, setPools] = useState({});

  useEffect(() => {
    if (!allPositions.length) {
      return;
    }

    const poolParams = allPositions.reduce(
      (accm: { [index: string]: any }, position) => {
        const key = `${position.token0address}-${position.token1address}-${position.fee}`;
        accm[key] = {
          key,
          token0address: position.token0address,
          token1address: position.token1address,
          fee: position.fee,
        };

        return accm;
      },
      {}
    );

    setPoolParams(Object.values(poolParams));
  }, [allPositions]);

  useEffect(() => {}, [poolContracts]);

  return (
    <PoolsContext.Provider value={{ pools }}>{children}</PoolsContext.Provider>
  );
};
