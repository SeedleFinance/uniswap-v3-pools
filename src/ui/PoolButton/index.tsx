import React from 'react';
import { Token } from '@uniswap/sdk-core';

import TokenLogo from '../TokenLogo';
import TokenLabel from '../TokenLabel';
import Button from '../Button';

interface Props {
  baseToken: Token;
  quoteToken: Token;
  fee?: number;
  onClick: () => void;
  tabIndex?: number;
  showNetwork?: boolean;
  size?: 'xs' | 'sm' | 'lg';
}

function getChainNameAndColor(chainId: number) {
  const chains: { [id: number]: string[] } = {
    1: ['Mainnet', 'bg-gray-200 text-black', 'ethereum'],
    10: ['Optimism', 'bg-red-200 text-red-700', 'optimism'],
    42161: ['Arbitrum', 'bg-blue-200 text-blue-700', 'arbitrum'],
    137: ['Polygon', 'bg-indigo-300 text-indigo-600', 'polygon'],
  };

  return chains[chainId] || chains[1];
}

function PoolButton({ baseToken, quoteToken, fee, onClick, tabIndex, showNetwork, size }: Props) {
  const [chainName, chainColor, chainLogoName] = getChainNameAndColor(baseToken.chainId);
  return (
    <Button
      className="flex items-center focus:border-0 p-0"
      tabIndex={tabIndex || 0}
      onClick={onClick}
      variant="ghost"
      size="xs"
    >
      <div className="flex items-center">
        <div className="flex flex-shrink-0 mr-1 items-center">
          <TokenLogo
            chain={chainLogoName}
            name={quoteToken.name}
            address={quoteToken.address}
            size={size}
          />
          <TokenLogo
            chain={chainLogoName}
            name={baseToken.name}
            address={baseToken.address}
            size={size}
            className="-ml-2"
          />
        </div>
        <div className="flex flex-col mx-1">
          <div>
            <TokenLabel name={quoteToken.name} symbol={quoteToken.symbol} size={size} />
            <span className="mx-1">/</span>
            <TokenLabel name={baseToken.name} symbol={baseToken.symbol} size={size} />
          </div>
        </div>
      </div>
      <div className="hidden md:flex">
        {fee && (
          <span className="rounded-md bg-gray-400 text-inverted text-0.8125 ml-1 px-1 font-medium">
            {fee}%
          </span>
        )}
        {showNetwork && (
          <div className={`hidden md:block rounded-md ml-2 px-1 text-0.8125 ${chainColor}`}>
            {chainName}
            {baseToken.symbol === 'vUSD' ? ' / PerpV2' : ''}
          </div>
        )}
      </div>
    </Button>
  );
}

export default PoolButton;
