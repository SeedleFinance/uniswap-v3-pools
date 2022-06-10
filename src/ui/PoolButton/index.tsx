import React from 'react';
import { Token } from '@uniswap/sdk-core';

import TokenLogo from '../TokenLogo';
import TokenLabel from '../TokenLabel';
import { Button } from '../Button';

interface Props {
  baseToken: Token;
  quoteToken: Token;
  fee?: number;
  onClick: () => void;
  tabIndex?: number;
  showNetwork?: boolean;
}

function getChainNameAndColor(chainId: number) {
  const chains: { [id: number]: string[] } = {
    1: ['Mainnet', 'bg-gray-200 text-medium', 'ethereum'],
    10: ['Optimism', 'bg-red-200 text-red-700', 'optimism'],
    42161: ['Arbitrum', 'bg-blue-200 text-blue-700', 'arbitrum'],
    137: ['Polygon', 'bg-indigo-300 text-indigo-600', 'polygon'],
  };

  return chains[chainId] || chains[1];
}

function PoolButton({ baseToken, quoteToken, fee, onClick, tabIndex, showNetwork }: Props) {
  const [chainName, chainColor, chainLogoName] = getChainNameAndColor(baseToken.chainId);
  return (
    <Button
      className="flex items-center p-1 focus:border-0"
      tabIndex={tabIndex || 0}
      onClick={onClick}
      variant="ghost"
    >
      <div className="flex mr-2 items-center">
        <TokenLogo chain={chainLogoName} name={quoteToken.name} address={quoteToken.address} />
        <TokenLogo chain={chainLogoName} name={baseToken.name} address={baseToken.address} />
      </div>
      <div className="flex flex-col mx-2 mt-1">
        <div>
          <TokenLabel name={quoteToken.name} symbol={quoteToken.symbol} />
          <span className="px-1">/</span>
          <TokenLabel name={baseToken.name} symbol={baseToken.symbol} />
        </div>
      </div>
      {fee && (
        <span className="rounded-md bg-gray-200 text-high ml-1 px-1 font-medium">{fee}%</span>
      )}
      {showNetwork && (
        <div className={`rounded-md ml-2 px-1 text-0.875 ${chainColor}`}>
          {chainName}
          {baseToken.symbol === 'vUSD' ? ' / PerpV2' : ''}
        </div>
      )}
    </Button>
  );
}

export default PoolButton;
