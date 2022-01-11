import React from "react";
import { Token } from "@uniswap/sdk-core";

import { usePoolsForNetwork } from "../../hooks/usePoolsForNetwork";

import Pools from "./Pools";

interface Props {
  chainId: number;
  filter: string;
  onPoolClick: (
    baseToken: Token,
    quoteToken: Token,
    fee: number,
    positions: any[]
  ) => void;
}

function ExistingPools({ chainId, onPoolClick, filter }: Props) {
  const { pools } = usePoolsForNetwork(chainId, true);

  return <Pools pools={pools} filter={filter} onPoolClick={onPoolClick} />;
}

export default ExistingPools;
