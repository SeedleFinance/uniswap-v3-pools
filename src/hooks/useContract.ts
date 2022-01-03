import { useMemo } from "react";
import { getAddress } from "@ethersproject/address";
import { Contract } from "@ethersproject/contracts";
import { AddressZero } from "@ethersproject/constants";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";

import { abi as NFTPositionManagerABI } from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { abi as V3PoolABI } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import ERC20_ABI from "../abis/erc20.json";
import ERC20_BYTES32_ABI from "../abis/erc20_bytes32.json";

import PerpMainMetadataOptimism from "@perp/curie-contract/metadata/optimism.json";
import { abi as PerpOrderBookABI } from "@perp/curie-contract/artifacts/contracts/OrderBook.sol/OrderBook.json";

import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from "../constants";

import { NonfungiblePositionManager } from "../types/v3/NonfungiblePositionManager";

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value);
  } catch {
    return false;
  }
}

// account is not optional
export function getSigner(
  library: Web3Provider,
  account: string
): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(
  library: Web3Provider,
  account?: string
): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}

export function getContract(
  address: string,
  ABI: any,
  library: Web3Provider,
  account?: string
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }

  return new Contract(
    address,
    ABI,
    getProviderOrSigner(library, account) as any
  );
}

// returns null on errors
export function useContract(
  address: string | undefined,
  ABI: any,
  withSignerIfPossible = true,
  providerLibrary?: Web3Provider
): Contract | null {
  const { library: injectedLibrary, account } = useWeb3React("injected");
  const library = providerLibrary || injectedLibrary;

  return useMemo(() => {
    if (!address || !ABI || !library) return null;
    try {
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined
      );
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [address, ABI, library, withSignerIfPossible, account]);
}

// returns null on errors
export function useContractBulk(
  addresses: (string | undefined)[],
  ABI: any,
  withSignerIfPossible = true,
  providerLibrary?: Web3Provider
): (Contract | null)[] {
  const { library: injectedLibrary, account } = useWeb3React("injected");
  const library = providerLibrary || injectedLibrary;
  return useMemo(() => {
    try {
      return addresses.map((address) => {
        if (!address || !ABI || !library) return null;
        return getContract(
          address,
          ABI,
          library,
          withSignerIfPossible && account ? account : undefined
        );
      });
    } catch (error) {
      console.error("Failed to get contract", error);
      return [];
    }
  }, [addresses, ABI, library, withSignerIfPossible, account]);
}

export function useV3NFTPositionManagerContract(): NonfungiblePositionManager | null {
  const { chainId } = useWeb3React();
  const address = chainId
    ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId as number]
    : undefined;
  return useContract(
    address,
    NFTPositionManagerABI
  ) as NonfungiblePositionManager | null;
}

export function useTokenContracts(
  addresses: string[],
  withSignerIfPossible?: boolean
): (Contract | null)[] {
  return useContractBulk(addresses, ERC20_ABI, withSignerIfPossible);
}

export function useBytes32TokenContracts(
  addresses: string[],
  withSignerIfPossible?: boolean
): (Contract | null)[] {
  return useContractBulk(addresses, ERC20_BYTES32_ABI, withSignerIfPossible);
}

export function usePoolContract(
  token0: Token | null,
  token1: Token | null,
  fee: number,
  providerLibrary?: Web3Provider,
  withSignerIfPossible?: boolean
): Contract | null {
  const address =
    token0 && token1 && !token0.equals(token1)
      ? Pool.getAddress(token0, token1, fee)
      : undefined;
  return useContract(address, V3PoolABI, withSignerIfPossible, providerLibrary);
}

export interface PoolParams {
  key: string;
  token0: Token | null;
  token1: Token | null;
  fee: number;
  quoteToken?: Token;
  baseToken?: Token;
}

export function usePoolContracts(
  addresses: string[],
  providerLibrary?: Web3Provider,
  withSignerIfPossible?: boolean
): (Contract | null)[] {
  return useContractBulk(
    addresses,
    V3PoolABI,
    withSignerIfPossible,
    providerLibrary
  );
}

export function usePerpOrderBookContract(
  providerLibrary?: Web3Provider,
  withSignerIfPossible?: boolean
) {
  const { contracts } = PerpMainMetadataOptimism;
  const { address } = contracts.OrderBook;

  return useContract(
    address,
    PerpOrderBookABI,
    withSignerIfPossible,
    providerLibrary
  );
}
