import React, { useMemo } from "react";
import { useWeb3React } from "@web3-react/core";

import { injectedConnector } from "./utils/connectors";

interface AccountProps {
  address: string | null | undefined;
}

function Account({ address }: AccountProps) {
  const { activate } = useWeb3React();

  const truncatedAddress = useMemo(() => {
    if (!address || !address.length) {
      return "";
    }
    return `${address.substr(0, 6)}...${address.substr(-4)}`;
  }, [address]);

  const connectWallet = () => {
    activate(injectedConnector, (err) => {
      console.error(err);
    });
  };

  if (!address || !address.length) {
    return (
      <button
        className="p-2 rounded-md border focus:outline-none focus:border-gray-400"
        onClick={connectWallet}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="p-2 rounded-md border">
      <a href={`https://etherscan.io/address/${address}`}>{truncatedAddress}</a>
    </div>
  );
}

export default Account;
