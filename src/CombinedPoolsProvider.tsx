import React, { ReactNode, useContext, useMemo } from 'react';

import { PoolState } from './hooks/usePoolsState';
import { usePoolsForNetwork } from './hooks/usePoolsForNetwork';
import { usePerpV2 } from './hooks/usePerpV2';

const PoolsContext = React.createContext({
  pools: [] as PoolState[],
  loading: true,
  empty: false,
});
export const usePools = () => useContext(PoolsContext);

interface Props {
  children: ReactNode;
}

export const CombinedPoolsProvider = ({ children }: Props) => {
  const { loading: mainnetLoading, pools: mainnetPools } = usePoolsForNetwork(1);
  const { loading: optimismLoading, pools: optimismPools } = usePoolsForNetwork(10);
  const { loading: arbitrumLoading, pools: arbitrumPools } = usePoolsForNetwork(42161);
  const { loading: polygonLoading, pools: polygonPools } = usePoolsForNetwork(137);
  const { loading: perpLoading, pools: perpPools } = usePerpV2(10);

  const loading = useMemo(() => {
    return mainnetLoading || optimismLoading || arbitrumLoading || polygonLoading || perpLoading;
  }, [mainnetLoading, optimismLoading, arbitrumLoading, polygonLoading, perpLoading]);

  const pools = useMemo(() => {
    return [...mainnetPools, ...arbitrumPools, ...optimismPools, ...polygonPools, ...perpPools];
  }, [mainnetPools, arbitrumPools, optimismPools, polygonPools, perpPools]);

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
