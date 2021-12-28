import { useEffect, useMemo } from "react";
import { Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";

import { useChainWeb3React } from "./useChainWeb3React";
import { useAppSettings } from "../AppSettingsProvider";
import { useAddress } from "../AddressProvider";
import { getNetworkConnector } from "../utils/connectors";
import { useQueryPositions, PositionState } from "./useQueryPositions";
import { usePoolContracts } from "./useContract";
import { usePoolsState } from "./usePoolsState";

export function usePoolsForNetwork(chainId: number) {
  const { library, activate, active } = useChainWeb3React(chainId);
  const { filterClosed } = useAppSettings();

  useEffect(() => {
    if (!active) {
      const networkConnector = getNetworkConnector();
      networkConnector.changeChainId(chainId);

      activate(networkConnector, (err) => {
        console.error(err);
      });
    }
  }, [chainId, activate, active]);

  const { addresses } = useAddress();

  const { loading: queryLoading, positionStates: allPositions } =
    useQueryPositions(chainId, addresses);

  const filteredPositions = useMemo(() => {
    if (filterClosed) {
      return allPositions.filter(
        (position) => position && !position.liquidity.isZero()
      );
    }
    return allPositions;
  }, [allPositions, filterClosed]);

  const positionsByPool = useMemo((): {
    [key: string]: PositionState[];
  } => {
    if (!filteredPositions.length) {
      return {};
    }
    const positionsByPool: { [key: string]: PositionState[] } = {};

    filteredPositions.forEach((position) => {
      if (!position) {
        return;
      }

      const { token0, token1 } = position;
      const key = Pool.getAddress(
        token0 as Token,
        token1 as Token,
        position.fee
      );

      const collection = positionsByPool[key] || [];
      collection.push(position);
      positionsByPool[key] = collection;
    });

    return positionsByPool;
  }, [filteredPositions]);

  const poolKeys = useMemo(
    () => Object.keys(positionsByPool),
    [positionsByPool]
  );
  const poolContracts = usePoolContracts(poolKeys, library);
  const pools = usePoolsState(poolContracts, positionsByPool);
  const poolsLoading = useMemo(
    () => poolKeys.length > 0 && pools === null,
    [poolKeys, pools]
  );

  return { loading: queryLoading || poolsLoading, pools: pools || [] };
}
