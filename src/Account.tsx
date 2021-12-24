import React, { useMemo } from "react";
import { useWeb3React } from "@web3-react/core";

import { injectedConnector } from "./utils/connectors";

interface AccountProps {
  address: string | null | undefined;
}

function Account({ address }: AccountProps) {
  const { chainId, activate } = useWeb3React("injected");

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

  const chainName = useMemo(() => {
    if (!chainId) {
      return "unknown";
    }

    const chains: { [key: number]: string } = {
      1: "ethereum",
      10: "optimism",
      42161: "arbitrum",
      137: "polygon",
    };

    return chains[chainId as number] || "unknown";
  }, [chainId]);

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
    <>
      <div className="p-2 rounded-md border flex items-center">
        <img
          className={`w-6 h-6 mr-1 rounded-full bg-white text-sm`}
          alt={`${chainName} logo`}
          src={
            chainName !== "unknown"
              ? `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainName}/info/logo.png`
              : "/missing-icon.svg"
          }
        />
        <a href={`https://etherscan.io/address/${address}`}>
          {truncatedAddress}
        </a>
      </div>
    </>
  );
}

export default Account;
