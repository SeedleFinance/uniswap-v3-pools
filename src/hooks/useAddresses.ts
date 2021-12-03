import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

export function useAddresses() {
  const { library } = useWeb3React("mainnet");
  const { account } = useWeb3React("injected");
  const [addresses, setAddresses] = useState<string[]>([]);

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
          if (addr.endsWith(".eth")) {
            ensNames.push(addr);
          } else {
            hexAddresses.push(addr);
          }
        });
      }

      const resolveName = async (name: string) =>
        await library.resolveName(name);

      const resolvedAddresses = await Promise.all(
        ensNames.map((name) => resolveName(name))
      );

      let results = [...hexAddresses, ...resolvedAddresses];
      if (!noWallet && account) {
        results.push(account as string);
      }

      setAddresses(results);
    };

    if (library) {
      fetchAddresses();
    }
  }, [library, account]);

  return addresses;
}
