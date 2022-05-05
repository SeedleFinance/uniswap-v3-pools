import { useWeb3React } from '@web3-react/core';

const chains: { [id: number]: string } = {
  1: 'mainnet',
  10: 'optimism',
  42161: 'arbitrum',
  137: 'polygon',
};

export function useChainWeb3React(chainId: number) {
  const web3React = useWeb3React(chains[chainId] || 'mainnet');

  return web3React;
}
