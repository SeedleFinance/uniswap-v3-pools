import React, { ReactNode, useContext, useMemo } from "react";
import { uniq } from "lodash";
import { useWeb3React } from "@web3-react/core";
import { ChainId, WETH9, Token } from "@uniswap/sdk-core";

import { useAllPositions, PositionState } from "./hooks/usePosition";
import { usePoolContracts, PoolParams } from "./hooks/useContract";
import { useTokens } from "./hooks/useToken";
import { usePoolsState, PoolState } from "./hooks/usePool";
import { usePriceQuoter } from "./hooks/usePriceQuoter";

import { DAI, USDC, USDT, FEI } from "./constants";

const PoolsContext = React.createContext({ pools: [] as PoolState[] });
export const usePools = () => useContext(PoolsContext);

interface Props {
  children: ReactNode;
  account: string | null | undefined;
}

function getQuoteAndBaseToken(
  chainId: ChainId | undefined,
  token0: Token,
  token1: Token
): [Token, Token] {
  let quote = token0;
  let base = token1;

  if (!chainId || !token0 || !token1) {
    return [quote, base];
  }

  const quoteCurrencies: Token[] = [USDC, USDT, DAI, FEI, WETH9[chainId]];

  quoteCurrencies.some((cur) => {
    if (token0.equals(cur)) {
      quote = token0;
      base = token1;
      return true;
    } else if (token1.equals(cur)) {
      quote = token1;
      base = token0;
      return true;
    }
    return false;
  });

  return [quote, base];
}

export const PoolsProvider = ({ account, children }: Props) => {
  const { chainId } = useWeb3React();
  const allPositions = useAllPositions(account);

  const tokenAddresses = useMemo(() => {
    if (!allPositions.length) {
      return [];
    }

    return uniq(
      allPositions.reduce((accm: string[], position: any) => {
        return [...accm, position.token0address, position.token1address];
      }, [])
    );
  }, [allPositions]);

  const tokens = useTokens(tokenAddresses);

  const { poolParams, positionsByPool } = useMemo((): {
    poolParams: PoolParams[];
    positionsByPool: {
      [key: string]: PositionState[];
    };
  } => {
    if (!allPositions.length && !tokens.length) {
      return { poolParams: [], positionsByPool: {} };
    }

    const positionsByPool: { [key: string]: PositionState[] } = {};
    const poolParamsObj = allPositions.reduce(
      (accm: { [index: string]: any }, position) => {
        const key = `${position.token0address}-${position.token1address}-${position.fee}`;

        // add position to pool
        const collection = positionsByPool[key] || [];
        positionsByPool[key] = [...collection, position];

        const token0 = tokens[position.token0address];
        const token1 = tokens[position.token1address];
        const [quoteToken, baseToken] =
          token0 && token1
            ? getQuoteAndBaseToken(chainId, token0, token1)
            : [token0, token1];

        accm[key] = {
          key,
          token0,
          token1,
          fee: position.fee,
          quoteToken,
          baseToken,
        };

        return accm;
      },
      {}
    );

    return { poolParams: Object.values(poolParamsObj), positionsByPool };
  }, [chainId, allPositions, tokens]);

  const poolContracts = usePoolContracts(poolParams);

  const pools = usePoolsState(poolContracts, poolParams, positionsByPool);

  const amounts = usePriceQuoter([{ tokens: [USDC, DAI], fees: [500] }]);
  console.log(amounts);

  return (
    <PoolsContext.Provider value={{ pools }}>{children}</PoolsContext.Provider>
  );
};
