import React, { ReactNode, useContext, useMemo, useState } from 'react';

import { usePoolsForNetwork } from './hooks/usePoolsForNetwork';
//import { usePerpV2 } from './hooks/usePerpV2';

const PoolsContext = React.createContext({
  pools: [] as any[],
  loading: true,
  empty: false,
  lastLoaded: +new Date(),
  refresh: () => {},
});
export const usePools = () => useContext(PoolsContext);

interface Props {
  children: ReactNode;
}

export const CombinedPoolsProvider = ({ children }: Props) => {
  const [lastLoaded, setLastLoaded] = useState(+new Date());

  const { loading: mainnetLoading, pools: mainnetPools } = usePoolsForNetwork(1, lastLoaded);

  const loading = useMemo(() => {
    return mainnetLoading;
  }, [mainnetLoading]);

  const pools = useMemo(() => {
    return [...mainnetPools];
  }, [mainnetPools]);

  const empty = useMemo(() => !loading && !pools.length, [loading, pools]);

  const refresh = () => setLastLoaded(+new Date());

  return (
    <PoolsContext.Provider
      value={{
        pools,
        empty,
        loading,
        lastLoaded,
        refresh,
      }}
    >
      {children}
    </PoolsContext.Provider>
  );
};
