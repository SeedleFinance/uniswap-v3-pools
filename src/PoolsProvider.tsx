import React, { ReactNode, useContext, useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import { WETH9, Token, CurrencyAmount } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";

import { useQueryPositions, PositionState } from "./hooks/useQueryPositions";
import { usePoolContracts } from "./hooks/useContract";
import { usePoolsState, PoolState } from "./hooks/usePoolsState";
import { useEthPrice } from "./hooks/useEthPrice";

import { DAI, USDC, USDT, PAX, FEI } from "./constants";
import { formatCurrency } from "./utils/numbers";
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
  const allPositions = useQueryPositions(chainId as number, [
    account as string,
  ]);

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

  const poolContracts = usePoolContracts(Object.keys(positionsByPool));
  const pools: PoolState[] = usePoolsState(poolContracts, positionsByPool);

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

  // sort pools by liquidity
  const sortedPools = pools.sort((a, b) => {
    const aLiq = convertToGlobal(a.poolLiquidity);
    const bLiq = convertToGlobal(b.poolLiquidity);
    return bLiq - aLiq;
  });

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
        pools: sortedPools,
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
