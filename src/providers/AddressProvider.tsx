import React, { ReactNode, useContext, useState, useEffect } from "react";
import { isAddress } from "@ethersproject/address";
import { useAccount, useConnect, useProvider } from "wagmi";

const AddressContext = React.createContext({
  addresses: [] as string[],
  injectedAddress: null as string | null | undefined,
  addressReady: false,
});
export const useAddress = () => useContext(AddressContext);

interface Props {
  children: ReactNode;
}

export const AddressProvider = ({ children }: Props) => {
  const library = useProvider({ chainId: 1 });
  const { address: account, isConnected, connector } = useAccount();
  const { connect } = useConnect();

  const [addresses, setAddresses] = useState<string[]>([]);

  useEffect(() => {
    if (!isConnected && connector) {
      connect({ connector });
    }
  }, [isConnected, connect, connector]);

  useEffect(() => {
    const fetchAddresses = async () => {
      const { location } = window;
      const searchParams = new URLSearchParams(location.search);
      const inputAddresses = searchParams.getAll("addr");
      const noWallet = searchParams.has("nw");

      const hexAddresses: string[] = [];
      const ensNames: string[] = [];

      if (inputAddresses.length) {
        inputAddresses.forEach((addr) => {
          if (isAddress(addr)) {
            hexAddresses.push(addr);
          } else {
            // if an address doesn't look hex, treat as an ENS name
            ensNames.push(addr);
          }
        });
      }

      const resolveName = async (name: string) =>
        await library.resolveName(name);

      const resolvedAddresses = await Promise.all(
        ensNames.map((name) => resolveName(name))
      );

      const results: string[] = [
        ...hexAddresses,
        ...resolvedAddresses.filter((addr): addr is string => !!addr),
      ];
      if (!noWallet && account) {
        results.push(account as string);
      }

      setAddresses(results);
    };

    if (library) {
      fetchAddresses();
    }
  }, [library, account]);

  return (
    <AddressContext.Provider
      value={{
        addresses,
        injectedAddress: account,
        addressReady: addresses.length > 0,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};
