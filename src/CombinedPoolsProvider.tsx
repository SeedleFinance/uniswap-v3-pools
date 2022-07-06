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
  const [initalLoading, setInitialLoading] = useState(true);
  const [lastLoaded, setLastLoaded] = useState(+new Date());

  const {
    loading: mainnetLoading,
    pools: mainnetPools,
    feesLoading,
  } = usePoolsForNetwork(1, lastLoaded);

  const loading = useMemo(() => {
    return mainnetLoading;
  }, [mainnetLoading]);

  useEffect(() => {
    if (initalLoading) {
      setInitialLoading(loading);
    }
  }, [loading]);

  const refreshingList = useMemo(() => {
    return loading || feesLoading;
  }, [loading, feesLoading]);

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
    setLastLoaded(+new Date());
  };

  return (
    <PoolsContext.Provider
      value={{
        pools,
        empty,
        loading: initalLoading,
        lastLoaded,
        refreshingList,
        refresh,
      }}
    >
      {children}
    </PoolsContext.Provider>
  );
};
