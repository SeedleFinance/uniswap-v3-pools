import React, { useEffect } from "react";
import { Token } from "@uniswap/sdk-core";

import { usePools } from "../../PoolsProvider";
import { useAppSettings } from "../../AppSettingsProvider";

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

function ExistingPools({ onPoolClick, filter }: Props) {
  const { pools } = usePools();
  const { filterClosed, setFilterClosed } = useAppSettings();

  useEffect(() => {
    const currentFilterClosed = filterClosed;
    if (currentFilterClosed) {
      setFilterClosed(false);
    }

    return function reset() {
      if (currentFilterClosed) {
        setFilterClosed(true);
      }
    };
    // eslint-disable-next-line
  }, []); // this should run only on mount/unmount

  return <Pools pools={pools} filter={filter} onPoolClick={onPoolClick} />;
}

export default ExistingPools;
