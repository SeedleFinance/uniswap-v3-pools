import { useMemo } from 'react';
import { useNetwork } from 'wagmi';

import { ChainID } from '../enums';

export function useChainId() {
  const { chain } = useNetwork();
  const chainId = useMemo(() => (chain ? chain.id : ChainID.Mainnet), [chain]); // defaults to mainnet

  return chainId;
}
