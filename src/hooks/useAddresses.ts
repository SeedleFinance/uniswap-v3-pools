import { useWeb3React } from "@web3-react/core";

export function useAddresses() {
  const { account } = useWeb3React();

  const { location } = window;
  const searchParams = new URLSearchParams(location.search);
  const additionalAddresses = searchParams.getAll("addr");
  const noWallet = searchParams.has("nw");

  const addresses = [
    noWallet || !account ? "" : (account as string),
    ...additionalAddresses,
  ];
  return addresses;
}
