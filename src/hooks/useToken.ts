import { useState, useEffect } from "react";
import { parseBytes32String } from "@ethersproject/strings";
import { Token, WETH9, Currency } from "@uniswap/sdk-core";
import { useWeb3React } from "@web3-react/core";

import {
  useTokenContract,
  useBytes32TokenContract,
  useTokenContracts,
  useBytes32TokenContracts,
} from "./useContract";

function wrappedCurrency(currency: Currency, chainId: number) {
  if (currency.isNative) {
    return WETH9[chainId];
  }
  return currency;
}

export function useToken(address: string | undefined): Token | null {
  const { chainId } = useWeb3React();
  const contract = useTokenContract(address);
  const bytes32Contract = useBytes32TokenContract(address);

  const [token, setToken] = useState<Token | null>(null);

  useEffect(() => {
    if (!address || !contract || !bytes32Contract) {
      return;
    }

    const callContract = async (fn: string): Promise<any> => {
      try {
        const r = await contract.functions[fn]();
        return r[0];
      } catch (e) {
        // try bytes32 value if name is empty
        const r = await bytes32Contract.functions[fn]();
        return parseBytes32String(r[0]);
      }
    };

    const initToken = async () => {
      const name = await callContract("name");
      const symbol = await callContract("symbol");
      const decimals = await callContract("decimals");

      const token = new Token(
        chainId as number,
        address,
        decimals,
        symbol,
        name
      );
      setToken(token);
    };

    initToken();
  }, [address, contract, bytes32Contract, chainId]);

  return token && chainId ? wrappedCurrency(token, chainId) : null;
}

export function useTokens(addresses: string[]): {
  [address: string]: Token | null;
} {
  const { chainId } = useWeb3React();
  const contracts = useTokenContracts(addresses);
  const bytes32Contracts = useBytes32TokenContracts(addresses);

  const [tokens, setTokens] = useState<{ [address: string]: Token | null }>({});

  useEffect(() => {
    if (!addresses.length || !contracts || !bytes32Contracts) {
      return;
    }

    const callContract = async (idx: number, fn: string): Promise<any> => {
      try {
        const contract = contracts[idx];
        if (!contract) {
          throw new Error("Contract not found");
        }
        const r = await contract.functions[fn]();
        return r[0];
      } catch (e) {
        const bc = bytes32Contracts[idx];
        if (!bc) {
          return null;
        }
        // try bytes32 value if name is empty
        const r = await bc.functions[fn]();
        return parseBytes32String(r[0]);
      }
    };

    const getToken = async (address: string, idx: number) => {
      const name = await callContract(idx, "name");
      const symbol = await callContract(idx, "symbol");
      const decimals = await callContract(idx, "decimals");

      const token = new Token(
        chainId as number,
        address,
        decimals,
        symbol,
        name
      );
      return token && chainId ? wrappedCurrency(token, chainId) : null;
    };

    const _run = async () => {
      const tokens = await Promise.all(
        addresses.map((address, idx) => getToken(address, idx))
      );
      const tokenMap: { [address: string]: Token | null } = {};
      addresses.forEach((address, idx) => (tokenMap[address] = tokens[idx]));
      setTokens(tokenMap);
    };

    _run();
  }, [chainId, addresses, contracts, bytes32Contracts]);

  return tokens;
}
