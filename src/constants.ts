import { ChainId } from "@uniswap/sdk-core";

function constructSameAddressMap(
  address: string
): { [chainId in ChainId]: string } {
  return {
    [ChainId.MAINNET]: address,
    [ChainId.ROPSTEN]: address,
    [ChainId.KOVAN]: address,
    [ChainId.RINKEBY]: address,
    [ChainId.GÖRLI]: address
  };
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = constructSameAddressMap(
  "0xC36442b4a4522E871399CD717aBDD847Ab11FE88"
);
