import { useMemo, useCallback } from "react";
import { parseBytes32String } from "@ethersproject/strings";
import { formatUnits } from "@ethersproject/units";
import { Token, WETH9 } from "@uniswap/sdk-core";
import { useWeb3React } from "@web3-react/core";

import { useTokenContracts, useBytes32TokenContracts } from "./useContract";

export function useTokenBalances(
  tokens: Token[],
  owner: string | null | undefined
): () => Promise<string[]> {
  const { chainId, library } = useWeb3React();

  const addresses = useMemo(
    () => tokens.map((token) => token.address),
    [tokens]
  );
  const contracts = useTokenContracts(addresses);
  const bytes32Contracts = useBytes32TokenContracts(addresses);

  return useCallback(async () => {
    if (
      !chainId ||
      !library ||
      !tokens.length ||
      !owner ||
      !contracts ||
      !bytes32Contracts
    ) {
      return [];
    }

    const callContract = async (
      idx: number,
      fn: string,
      args: any[]
    ): Promise<any> => {
      try {
        const contract = contracts[idx];
        if (!contract) {
          throw new Error("Contract not found");
        }
        const r = await contract.functions[fn](...args);
        return r[0];
      } catch (e) {
        const bc = bytes32Contracts[idx];
        if (!bc) {
          return null;
        }
        // try bytes32 value if name is empty
        const r = await bc.functions[fn](...args);
        return parseBytes32String(r[0]);
      }
    };

    const getBalance = async (token: Token, idx: number) => {
      const balance = token.equals(WETH9[chainId])
        ? await library.getBalance(owner)
        : await callContract(idx, "balanceOf", [owner]);
      return formatUnits(balance, token.decimals);
    };

    return await Promise.all(
      tokens.map((token, idx) => getBalance(token, idx))
    );
  }, [chainId, library, tokens, owner, contracts, bytes32Contracts]);
}
