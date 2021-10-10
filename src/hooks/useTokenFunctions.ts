import { useMemo, useCallback } from "react";
import { parseBytes32String } from "@ethersproject/strings";
import { formatUnits } from "@ethersproject/units";
import { CurrencyAmount, Token, WETH9, MaxUint256 } from "@uniswap/sdk-core";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "@ethersproject/bignumber";

import { useTokenContracts, useBytes32TokenContracts } from "./useContract";

const callContract = async (
  contracts: any[],
  bytes32Contracts: any[],
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

export function useTokenFunctions(
  tokens: Token[],
  owner: string | null | undefined
): {
  getBalances: () => Promise<string[]>;
  getAllowances: (spender: string) => Promise<number[]>;
  approveToken: (idx: number, amount: number) => Promise<boolean>;
} {
  const { chainId, library } = useWeb3React();

  const addresses = useMemo(
    () => tokens.map((token) => token.address),
    [tokens]
  );
  const contracts = useTokenContracts(addresses);
  const bytes32Contracts = useBytes32TokenContracts(addresses);

  const getBalances = useCallback(async (): Promise<string[]> => {
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

    return await Promise.all(
      tokens.map(async (token: Token, idx: number) => {
        const balance = token.equals(WETH9[chainId])
          ? await library.getBalance(owner)
          : await callContract(contracts, bytes32Contracts, idx, "balanceOf", [
              owner,
            ]);
        return formatUnits(balance, token.decimals);
      })
    );
  }, [chainId, library, tokens, owner, contracts, bytes32Contracts]);

  const getAllowances = useCallback(
    async (spender: string): Promise<number[]> => {
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

      return await Promise.all(
        tokens.map(async (token: Token, idx: number) => {
          const allowance = await callContract(
            contracts,
            bytes32Contracts,
            idx,
            "allowance",
            [owner, spender]
          );
          return parseFloat(
            CurrencyAmount.fromRawAmount(
              token,
              allowance.toString()
            ).toSignificant(16)
          );
        })
      );
    },
    [chainId, library, tokens, owner, contracts, bytes32Contracts]
  );

  const approveToken = useCallback(
    async (idx: number, amount: number) => {
      if (!chainId || !library || !contracts || !owner) {
        return false;
      }

      const contract = contracts[idx];
      if (!contract) {
        return false;
      }

      const amountToApprove = BigNumber.from(Math.ceil(amount));
      let estimatedGas = BigNumber.from(0);
      let useExact = false;
      try {
        estimatedGas = await contract.estimateGas.approve(owner, MaxUint256);
      } catch (e) {
        // fallback for tokens who restrict approval amounts
        estimatedGas = await contract.estimateGas.approve(
          owner,
          amountToApprove
        );
        useExact = true;
      }

      try {
        await contract.approve(owner, useExact ? amountToApprove : MaxUint256, {
          gasLimit: estimatedGas
            .mul(BigNumber.from(10000 + 2000))
            .div(BigNumber.from(10000)),
        });
        return true;
      } catch (e) {
        console.error(e);
      }

      return false;
    },
    [chainId, library, contracts, owner]
  );

  return { getBalances, getAllowances, approveToken };
}
