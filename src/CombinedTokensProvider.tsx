import React, { ReactNode, useContext, useMemo } from 'react';

import { useTokensForNetwork } from './hooks/useTokensForNetwork';
import { ChainID } from './enums';

const TokensContext = React.createContext({
  tokens: [] as any[],
  loading: true,
  empty: false,
});
export const useTokens = () => useContext(TokensContext);

interface Props {
  children: ReactNode;
}

export const CombinedTokensProvider = ({ children }: Props) => {
  const { loading: mainnetLoading, tokens: mainnetTokens } = useTokensForNetwork(ChainID.Mainnet);
  const { loading: polygonLoading, tokens: polygonTokens } = useTokensForNetwork(ChainID.Matic);
  const { loading: arbitrumLoading, tokens: arbitrumTokens } = useTokensForNetwork(
    ChainID.Arbitrum,
  );

  const loading = useMemo(() => {
    return mainnetLoading || polygonLoading || arbitrumLoading;
  }, [mainnetLoading, polygonLoading, arbitrumLoading]);

  const tokens = useMemo(() => {
    return [...mainnetTokens, ...polygonTokens, ...arbitrumTokens];
  }, [mainnetTokens, polygonTokens, arbitrumTokens]);

  const empty = useMemo(() => {
    if (loading) {
      return false;
    }
    return !tokens.length;
  }, [loading, tokens]);

  return (
    <TokensContext.Provider
      value={{
        tokens,
        empty,
        loading,
      }}
    >
      {children}
    </TokensContext.Provider>
  );
};
