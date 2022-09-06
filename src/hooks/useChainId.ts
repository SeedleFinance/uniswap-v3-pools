import { useMemo } from 'react';
import { useNetwork } from 'wagmi';

import { ChainID } from '../types/enums';

export function useChainId() {
  const { chain } = useNetwork();
  const chainId = useMemo(() => (chain ? chain.id : ChainID.Mainnet), [chain]); // defaults to mainnet

  return chainId;
}
