import React from 'react';
import { Token } from '@uniswap/sdk-core';

import Pools from './Pools';

interface Props {
  chainId: number;
  filter: string;
  pools: any[]; // FIXME!
  onPoolClick: (baseToken: Token, quoteToken: Token, fee: number, positions: any[]) => void;
}

function ExistingPools({ chainId, onPoolClick, filter, pools }: Props) {
  return <Pools pools={pools} filter={filter} onPoolClick={onPoolClick} />;
}

export default ExistingPools;
