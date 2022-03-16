import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { getNetworkConnector, injectedConnector } from "../utils/connectors";
import { isAddress } from "@ethersproject/address";

export function useAddresses() {
  const { library, active, activate } = useWeb3React("mainnet");
  const {
    account,
    active: injectedActive,
    activate: activateInjected,
  } = useWeb3React("injected");
  const [addresses, setAddresses] = useState<string[]>([]);

  useEffect(() => {
    if (!active) {
      const networkConnector = getNetworkConnector();
      networkConnector.changeChainId(1);

      activate(networkConnector, (err) => {
        console.error(err);
      });
    }
  }, [activate, active]);

  useEffect(() => {
    if (!injectedActive) {
      activateInjected(injectedConnector, (err) => {
        // ignore error
        //console.error(err);
      });
    }
  }, [activateInjected, injectedActive]);

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
            ensNames.push(addr);
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
