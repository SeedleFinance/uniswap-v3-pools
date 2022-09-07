import React from 'react';
import { Token } from '@uniswap/sdk-core';
import endOfYesterday from 'date-fns/endOfYesterday';

import { useChainId } from '../../hooks/useChainId';
import { useTopPools } from '../../hooks/useTopPools';
import Pools from './Pools';

interface Props {
  filter: string;
  onPoolClick: (baseToken: Token, quoteToken: Token, fee: number, positions: any[]) => void;
}

function NewPools({ onPoolClick, filter }: Props) {
  const chainId = useChainId();
  const date = +endOfYesterday().setUTCHours(0, 0, 0, 0) / 1000;
  const pools = useTopPools(chainId || 1, date);

  return <Pools pools={pools} filter={filter} onPoolClick={onPoolClick} />;
}

export default NewPools;
