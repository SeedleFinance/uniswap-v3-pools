import React from 'react';
import { Token } from '@uniswap/sdk-core';

import TokenLogo from '../TokenLogo';
import TokenLabel from '../TokenLabel';
import Button from '../Button';
import { getChainNameAndColor } from '../../utils/chains';

export type TokenSize = 'lg' | 'md' | 'sm' | 'xs';

interface Props {
  baseToken: Token;
  quoteToken: Token;
  fee?: number;
  onClick: () => void;
  tabIndex?: number;
  showNetwork?: boolean;
  size: TokenSize;
}

function PoolButton({
  baseToken,
  quoteToken,
  fee,
  onClick,
  tabIndex,
  showNetwork,
  size = 'lg',
}: Props) {
  const [chainName, chainColor, chainLogoName] = getChainNameAndColor(baseToken.chainId);
  return (
    <Button
      className="flex items-center focus:border-0 p-0"
      tabIndex={tabIndex || 0}
      onClick={onClick}
      variant="ghost"
      size="xs"
    >
      <div className="flex items-center flex-shrink-0">
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
        <div>
          <TokenLabel name={quoteToken.name} symbol={quoteToken.symbol} size={size} />
          <span className="mx-1">/</span>
          <TokenLabel name={baseToken.name} symbol={baseToken.symbol} size={size} />
        </div>
      </div>
      <div className="flex items-center">
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
