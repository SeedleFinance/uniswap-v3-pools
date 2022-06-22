import React, { ReactNode, useContext, useMemo } from 'react';

import { usePoolsForNetwork } from './hooks/usePoolsForNetwork';
import { usePerpV2 } from './hooks/usePerpV2';

const PoolsContext = React.createContext({
  pools: [] as any[],
  loading: true,
  empty: false,
});
export const usePools = () => useContext(PoolsContext);

interface Props {
  children: ReactNode;
}

export const CombinedPoolsProvider = ({ children }: Props) => {
  const { loading: mainnetLoading, pools: mainnetPools } = usePoolsForNetwork(1);

  const loading = useMemo(() => {
    return mainnetLoading;
  }, [mainnetLoading]);

  const pools = useMemo(() => {
    return [...mainnetPools];
  }, [mainnetPools]);

  const empty = useMemo(() => !loading && !pools.length, [loading, pools]);

  return (
    <PoolsContext.Provider
      value={{
        pools,
        empty,
        loading,
      }}
    >
      {children}
    </PoolsContext.Provider>
  );
};
