import React from 'react';
import { Token } from '@uniswap/sdk-core';

import { PoolState } from '../../hooks/usePoolsState';

import Pools from './Pools';

interface Props {
  chainId: number;
  filter: string;
  pools: PoolState[];
  onPoolClick: (baseToken: Token, quoteToken: Token, fee: number, positions: any[]) => void;
}

function ExistingPools({ chainId, onPoolClick, filter, pools }: Props) {
  return <Pools pools={pools} filter={filter} onPoolClick={onPoolClick} />;
}

export default ExistingPools;
