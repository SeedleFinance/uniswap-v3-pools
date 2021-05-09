import { useState, useEffect } from "react";
import { parseBytes32String } from "@ethersproject/strings";
import { ChainId, Token } from "@uniswap/sdk-core";
import { useWeb3React } from "@web3-react/core";

import { useTokenContract, useBytes32TokenContract } from "./useContract";

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
        chainId as ChainId,
        address,
        decimals,
        symbol,
        name
      );
      setToken(token);
    };

    initToken();
  }, [address, contract, bytes32Contract, chainId]);

  return token;
}
