import React from "react";
import { useWeb3React } from "@web3-react/core";
import { Token } from "@uniswap/sdk-core";
import endOfYesterday from "date-fns/endOfYesterday";

import { useTopPools } from "../../hooks/useTopPools";
import Pools from "./Pools";

interface Props {
  filter: string;
  onPoolClick: (
    baseToken: Token,
    quoteToken: Token,
    fee: number,
    positions: any[]
  ) => void;
}

function NewPools({ onPoolClick, filter }: Props) {
  const { chainId } = useWeb3React("injected");
  const date = +endOfYesterday().setUTCHours(0, 0, 0, 0) / 1000;
  const pools = useTopPools(chainId || 1, date);

  return <Pools pools={pools} filter={filter} onPoolClick={onPoolClick} />;
}

export default NewPools;
