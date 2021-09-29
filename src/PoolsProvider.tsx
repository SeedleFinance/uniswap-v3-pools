import React, { ReactNode, useContext, useMemo } from "react";
import { uniq } from "lodash";
import { useWeb3React } from "@web3-react/core";
import { WETH9, Token, CurrencyAmount } from "@uniswap/sdk-core";

import { useAllPositions, PositionState } from "./hooks/usePosition";
import { usePoolContracts, PoolParams } from "./hooks/useContract";
import { useTokens } from "./hooks/useTokens";
import { usePoolsState, PoolState } from "./hooks/usePool";
import { useEthPrice } from "./hooks/useEthPrice";

import { DAI, USDC, USDT, PAX, FEI } from "./constants";
import { formatCurrency } from "./utils/numbers";
import { getQuoteAndBaseToken } from "./utils/tokens";
import { useAppSettings } from "./AppSettingsProvider";

const PoolsContext = React.createContext({
  pools: [] as PoolState[],
  totalLiquidity: 0,
  totalUncollectedFees: 0,
  convertToGlobal: (val: CurrencyAmount<Token>): number => {
    return 0;
  },
  convertToGlobalFormatted: (val: CurrencyAmount<Token>): string => {
    return "$0";
  },
  formatCurrencyWithSymbol: (val: number): string => {
    return "$0";
  },
});
export const usePools = () => useContext(PoolsContext);

interface Props {
  children: ReactNode;
  account: string | null | undefined;
}

export const PoolsProvider = ({ account, children }: Props) => {
  const { chainId } = useWeb3React();
  const ethPriceUSD = useEthPrice();
  const { filterClosed, globalCurrencyToken } = useAppSettings();
  const allPositions = useAllPositions(account);

  const filteredPositions = useMemo(() => {
    if (filterClosed) {
      return allPositions.filter((position) => !position.liquidity.isZero());
    }
    return allPositions;
  }, [allPositions, filterClosed]);

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
    if (!filteredPositions.length && !tokens.length) {
      return { poolParams: [], positionsByPool: {} };
    }

    const positionsByPool: { [key: string]: PositionState[] } = {};
    const poolParamsObj = filteredPositions.reduce(
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
  }, [chainId, filteredPositions, tokens]);

  const poolContracts = usePoolContracts(poolParams);

  const pools = usePoolsState(poolContracts, poolParams, positionsByPool);

  const isStableCoin = (token: Token): boolean => {
    if (token.equals(DAI)) {
      return true;
    } else if (token.equals(USDC)) {
      return true;
    } else if (token.equals(USDT)) {
      return true;
    } else if (token.equals(PAX)) {
      return true;
    } else if (token.equals(FEI)) {
      return true;
    }

    return false;
  };

  const convertToGlobal = (val: CurrencyAmount<Token>): number => {
    const valFloat = parseFloat(val.toSignificant(15));
    if (
      val.currency.equals(globalCurrencyToken) ||
      (globalCurrencyToken.equals(USDC) && isStableCoin(val.currency))
    ) {
      return valFloat;
    }

    if (globalCurrencyToken.equals(WETH9[chainId as number])) {
      return valFloat / ethPriceUSD;
    } else {
      return valFloat * ethPriceUSD;
    }
  };

  const formatCurrencyWithSymbol = (val: number): string => {
    const currencySymbol = globalCurrencyToken.equals(USDC) ? "$" : "Ξ";
    return formatCurrency(val, currencySymbol);
  };

  const convertToGlobalFormatted = (val: CurrencyAmount<Token>): string => {
    return formatCurrencyWithSymbol(convertToGlobal(val));
  };

  // calculate total
  const [totalLiquidity, totalUncollectedFees] = pools.reduce(
    (accm, pool) => {
      let totalLiquidity = 0;
      let totalUncollectedFees = 0;

      const { poolLiquidity, poolUncollectedFees } = pool;

      const poolLiquidityInGlobal = convertToGlobal(poolLiquidity);
      const uncollectedFeesInGlobal = convertToGlobal(poolUncollectedFees);

      totalLiquidity = accm[0] + poolLiquidityInGlobal;
      totalUncollectedFees = accm[1] + uncollectedFeesInGlobal;

      return [totalLiquidity, totalUncollectedFees];
    },
    [0, 0]
  );

  return (
    <PoolsContext.Provider
      value={{
        pools,
        totalLiquidity,
        totalUncollectedFees,
        convertToGlobal,
        convertToGlobalFormatted,
        formatCurrencyWithSymbol,
      }}
    >
      {children}
    </PoolsContext.Provider>
  );
};
