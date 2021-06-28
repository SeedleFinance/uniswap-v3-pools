import { useMemo } from "react";
import { getAddress } from "@ethersproject/address";
import { Contract } from "@ethersproject/contracts";
import { AddressZero } from "@ethersproject/constants";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { ChainId, Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";

import { abi as NFTPositionManagerABI } from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { abi as QuoterV2ABI } from "@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json";
import { abi as V3PoolABI } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import ERC20_ABI from "../abis/erc20.json";
import ERC20_BYTES32_ABI from "../abis/erc20_bytes32.json";

import {
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  QUOTER_V2_ADDRESSES,
} from "../constants";

import { NonfungiblePositionManager } from "../types/v3/NonfungiblePositionManager";
import { QuoterV2 } from "../types/v3/QuoterV2";

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
  withSignerIfPossible = true
): Contract | null {
  const { library, account } = useWeb3React();

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
  withSignerIfPossible = true
): (Contract | null)[] {
  const { library, account } = useWeb3React();
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
    ? NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId as ChainId]
    : undefined;
  return useContract(
    address,
    NFTPositionManagerABI
  ) as NonfungiblePositionManager | null;
}

export function useTokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible);
}

export function useTokenContracts(
  addresses: string[],
  withSignerIfPossible?: boolean
): (Contract | null)[] {
  return useContractBulk(addresses, ERC20_ABI, withSignerIfPossible);
}

export function useBytes32TokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible);
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
  withSignerIfPossible?: boolean
): Contract | null {
  const address =
    token0 && token1 && !token0.equals(token1)
      ? Pool.getAddress(token0, token1, fee)
      : undefined;
  return useContract(address, V3PoolABI, withSignerIfPossible);
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
  pools: PoolParams[],
  withSignerIfPossible?: boolean
): (Contract | null)[] {
  const addresses = pools.map(({ token0, token1, fee }) =>
    token0 && token1 && !token0.equals(token1)
      ? Pool.getAddress(token0, token1, fee)
      : undefined
  );

  return useContractBulk(addresses, V3PoolABI, withSignerIfPossible);
}

export function useQuoterV2Contract(
  withSignerIfPossible?: boolean
): QuoterV2 | null {
  const { chainId } = useWeb3React();
  const address = chainId ? QUOTER_V2_ADDRESSES[chainId as ChainId] : undefined;
  return useContract(
    address,
    QuoterV2ABI,
    withSignerIfPossible
  ) as QuoterV2 | null;
}
