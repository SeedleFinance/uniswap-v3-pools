import React, { ReactNode, useContext, useMemo } from 'react';

import { useTokensForNetwork } from './hooks/useTokensForNetwork';
import { useCurrencyConversions } from './CurrencyConversionsProvider';
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
  const { convertToGlobal } = useCurrencyConversions();

  const { loading: mainnetLoading, tokens: mainnetTokens } = useTokensForNetwork(ChainID.Mainnet);
  const { loading: polygonLoading, tokens: polygonTokens } = useTokensForNetwork(ChainID.Matic);
  const { loading: optimismLoading, tokens: optimismTokens } = useTokensForNetwork(
    ChainID.Optimism,
  );
  const { loading: arbitrumLoading, tokens: arbitrumTokens } = useTokensForNetwork(
    ChainID.Arbitrum,
  );

  const loading = useMemo(() => {
    return mainnetLoading || polygonLoading || optimismLoading || arbitrumLoading;
  }, [mainnetLoading, polygonLoading, optimismLoading, arbitrumLoading]);

  const tokens = useMemo(() => {
    return [...mainnetTokens, ...polygonTokens, ...optimismTokens, ...arbitrumTokens].sort((a, b) =>
      a.value.lessThan(b.value) ? 1 : -1,
    );
  }, [mainnetTokens, polygonTokens, optimismTokens, arbitrumTokens]);

  const empty = useMemo(() => {
    if (loading) {
      return false;
    }
    return !tokens.length;
  }, [loading, tokens]);

  const totalTokenValue = useMemo(() => {
    if (loading) {
      return 0;
    }
    return tokens.reduce((accm, token) => accm + convertToGlobal(token.value), 0);
  }, [loading, tokens]);

  return (
    <TokensContext.Provider
      value={{
        tokens,
        empty,
        loading,
        totalTokenValue,
      }}
    >
      {children}
    </TokensContext.Provider>
  );
};
