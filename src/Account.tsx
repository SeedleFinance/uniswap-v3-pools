import React, { useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';

import { injectedConnector } from './utils/connectors';
import { BLOCK_EXPLORER_URL } from './constants';
import useENS from './hooks/useENS';
import Davatar from '@davatar/react';
import { Button } from './ui/Button';

interface AccountProps {
  address: string | null | undefined;
}

function Account({ address }: AccountProps) {
  const { chainId, activate } = useWeb3React('injected');
  const { ensName } = useENS(address);

  const truncatedAddress = useMemo(() => {
    if (!address || !address.length) {
      return '';
    }
    return `${address.substr(0, 6)}...${address.substr(-4)}`;
  }, [address]);

  const connectWallet = () => {
    activate(injectedConnector, (err) => {
      console.error(err);
    });
  };

  const chainName = useMemo(() => {
    if (!chainId) {
      return 'unknown';
    }

    const chains: { [key: number]: string } = {
      1: 'ethereum',
      10: 'optimism',
      42161: 'arbitrum',
      137: 'polygon',
    };

    return chains[chainId as number] || 'unknown';
  }, [chainId]);

  if (!address || !address.length) {
    return (
      <Button
        className="p-2 bg-brand-primary hover:bg-brand-light text-inverted transition-colors duration-150 font-medium ease-out px-4 border-0"
        onClick={connectWallet}
      >
        Connect Wallet
      </Button>
    );
  }

  return (
    <>
      <div className="p-2 mx-1 rounded-md border border-slate-200 dark:border-slate-700 flex items-center flex flex-shrink-0">
        <img
          className={`w-6 h-6 mr-1 rounded-full bg-white dark:bg-slate-800 text-sm`}
          alt={`${chainName} logo`}
          src={
            chainName !== 'unknown'
              ? `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainName}/info/logo.png`
              : '/missing-icon.svg'
          }
        />
        <div className="flex items-center">
          <div className="mr-2">
            <Davatar size={20} address={address} generatedAvatarType="jazzicon" />
          </div>
          <a
            className="text-slate-600 dark:text-slate-300"
            href={`${BLOCK_EXPLORER_URL[chainId as number]}/address/${address}`}
          >
            {ensName || truncatedAddress}
          </a>
        </div>
      </div>
    </>
  );
}

export default Account;
