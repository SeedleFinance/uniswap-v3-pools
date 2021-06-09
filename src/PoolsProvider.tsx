import React, { ReactNode, useEffect, useState, useContext } from "react";
import { uniq, compact } from "lodash";
import { Contract } from "@ethersproject/contracts";
import { Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";

import { useAllPositions } from "./hooks/usePosition";
import { usePoolContracts, PoolParams } from "./hooks/useContract";
import { useTokens } from "./hooks/useToken";

const PoolsContext = React.createContext({ pools: [] as PoolState[] });
export const usePools = () => useContext(PoolsContext);

interface Props {
  children: ReactNode;
  account: string | null | undefined;
}

export interface PoolState {
  address: string;
  entity: Pool;
}

export const PoolsProvider = ({ account, children }: Props) => {
  const allPositions = useAllPositions(account);

  const [poolParams, setPoolParams] = useState<PoolParams[]>([]);
  const [tokenAddresses, setTokenAddresses] = useState<string[]>([]);
  const tokens = useTokens(tokenAddresses);
  const poolContracts = usePoolContracts(poolParams);

  const [pools, setPools] = useState<PoolState[]>([]);

  useEffect(() => {
    if (!allPositions.length) {
      return;
    }

    setTokenAddresses(
      uniq(
        allPositions.reduce((accm: string[], position: any) => {
          return [...accm, position.token0address, position.token1address];
        }, [])
      )
    );
  }, [allPositions]);

  useEffect(() => {
    if (!allPositions.length && !tokens.length) {
      return;
    }

    const poolParams = allPositions.reduce(
      (accm: { [index: string]: any }, position) => {
        const key = `${position.token0address}-${position.token1address}-${position.fee}`;
        accm[key] = {
          key,
          token0: tokens[position.token0address],
          token1: tokens[position.token1address],
          fee: position.fee,
        };

        return accm;
      },
      {}
    );

    setPoolParams(Object.values(poolParams));
  }, [allPositions, tokens]);

  useEffect(() => {
    if (!poolParams.length || !poolContracts.length) {
      return;
    }

    const callContract = async (contract: Contract | null, idx: number) => {
      if (!contract) {
        return null;
      }

      const result = await contract.functions.slot0();
      const sqrtPriceX96 = result[0];
      const tickCurrent = result[1];

      const liquidityResult = await contract.functions.liquidity();
      const liquidity = liquidityResult[0];

      const { token0, token1, fee } = poolParams[idx];

      return {
        address: contract.address.toLowerCase(),
        entity: new Pool(
          token0 as Token,
          token1 as Token,
          fee,
          sqrtPriceX96,
          liquidity,
          tickCurrent
        ),
      };
    };

    const collectPools = async () => {
      const pools = await Promise.all(
        poolContracts.map((contract: Contract | null, idx: number) =>
          callContract(contract, idx)
        )
      );
      setPools(compact(pools));
    };

    collectPools();
  }, [poolContracts, poolParams]);

  return (
    <PoolsContext.Provider value={{ pools }}>{children}</PoolsContext.Provider>
  );
};
