import { useWeb3React } from '@web3-react/core';

export function useChainId() {
  const { chainId } = useWeb3React();

  const defaultChainId = 1;
  return chainId || defaultChainId;
}
