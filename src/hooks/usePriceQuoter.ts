import { useEffect, useState } from "react";
import { Token } from "@uniswap/sdk-core";
import { BigNumber } from "@ethersproject/bignumber";

import { useQuoterV2Contract } from "./useContract";
import { encodePath } from "../utils/encodePath";

interface Path {
  tokens: Token[];
  fees: number[];
}

export function usePriceQuoter(paths: Path[]): BigNumber[] {
  const contract = useQuoterV2Contract();
  const [amounts, setAmounts] = useState<BigNumber[]>([]);

  useEffect(() => {
    if (!paths || !paths.length || !contract) {
      return;
    }

    const callContract = async (encoded: string, amount: number) => {
      if (!contract) {
        return BigNumber.from(0);
      }

      const result = await contract.callStatic.quoteExactInput(encoded, amount);
      console.log(result);
      return BigNumber.from(0);
    };

    const collectAmounts = async (paths: Path[]) => {
      const amounts = await Promise.all(
        paths.map(({ tokens, fees }) => {
          const tokenAddresses = tokens.map((t) => t.address);
          const encoded = encodePath(tokenAddresses, fees);
          return callContract(encoded, 10000);
        })
      );
      setAmounts(amounts);
    };

    collectAmounts(paths);
  }, [paths, contract]);

  return amounts;
}
