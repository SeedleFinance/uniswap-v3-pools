import React, { ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { usePoolsForNetwork } from './hooks/usePoolsForNetwork';
//import { usePerpV2 } from './hooks/usePerpV2';

const PoolsContext = React.createContext({
  pools: [] as any[],
  loading: true,
  empty: false,
  lastLoaded: +new Date(),
  refreshingList: false,
  refresh: () => {},
});
export const usePools = () => useContext(PoolsContext);

interface Props {
  children: ReactNode;
}

export const CombinedPoolsProvider = ({ children }: Props) => {
  const [loading, setLoading] = useState(true);
  const [lastLoaded, setLastLoaded] = useState(+new Date());
  const [refreshingList, setRefreshingList] = useState(false);

  const { loading: mainnetLoading, pools: mainnetPools } = usePoolsForNetwork(1, lastLoaded);

  useEffect(() => {
    if (!mainnetLoading) {
      setLoading(false);
      setRefreshingList(false);
    }
  }, [mainnetLoading, refreshingList]);

  const pools = useMemo(() => {
    return [...mainnetPools];
  }, [mainnetPools]);

  const empty = useMemo(() => {
    if (loading) {
      return false;
    }
    return !pools.length;
  }, [loading, pools]);

  const refresh = () => {
    setRefreshingList(true);
    setLastLoaded(+new Date());
  };

  return (
    <PoolsContext.Provider
      value={{
        pools,
        empty,
        loading,
        lastLoaded,
        refreshingList,
        refresh,
      }}
    >
      {children}
    </PoolsContext.Provider>
  );
};
