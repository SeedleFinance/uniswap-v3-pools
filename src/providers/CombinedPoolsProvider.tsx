import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { usePoolsForNetwork } from "../hooks/usePoolsForNetwork";
import { usePerpV2 } from "../hooks/usePerpV2";
import { ChainID } from "../types/enums";

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [lastLoaded, setLastLoaded] = useState(+new Date());

  const {
    loading: mainnetLoading,
    pools: mainnetPools,
    feesLoading: mainnetFeesLoading,
  } = usePoolsForNetwork(ChainID.Mainnet, lastLoaded);

  const {
    loading: polygonLoading,
    pools: polygonPools,
    feesLoading: polygonFeesLoading,
  } = usePoolsForNetwork(ChainID.Matic, lastLoaded);

  const {
    loading: optimismLoading,
    pools: optimismPools,
    feesLoading: optimismFeesLoading,
  } = usePoolsForNetwork(ChainID.Optimism, lastLoaded);

  const {
    loading: arbitrumLoading,
    pools: arbitrumPools,
    feesLoading: arbitrumFeesLoading,
  } = usePoolsForNetwork(ChainID.Arbitrum, lastLoaded);

  const { loading: perpLoading, pools: perpPools } = usePerpV2(10);

  const loading = useMemo(() => {
    return (
      mainnetLoading ||
      polygonLoading ||
      optimismLoading ||
      arbitrumLoading ||
      perpLoading
    );
  }, [
    mainnetLoading,
    polygonLoading,
    optimismLoading,
    arbitrumLoading,
    perpLoading,
  ]);

  const feesLoading = useMemo(() => {
    return (
      mainnetFeesLoading ||
      polygonFeesLoading ||
      optimismFeesLoading ||
      arbitrumFeesLoading
    );
  }, [
    mainnetFeesLoading,
    polygonFeesLoading,
    optimismFeesLoading,
    arbitrumFeesLoading,
  ]);

  useEffect(() => {
    console.log("here__");
    if (initialLoading && !loading) {
      setInitialLoading(false);
    }
  }, [initialLoading, loading]);

  const refreshingList = useMemo(() => {
    return loading || feesLoading;
  }, [loading, feesLoading]);

  const pools = useMemo(() => {
    return [
      ...mainnetPools,
      ...polygonPools,
      ...optimismPools,
      ...arbitrumPools,
      ...perpPools,
    ];
  }, [mainnetPools, polygonPools, optimismPools, arbitrumPools, perpPools]);

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
        loading: initialLoading,
        lastLoaded,
        refreshingList,
        refresh,
      }}
    >
      {children}
    </PoolsContext.Provider>
  );
};
