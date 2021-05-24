import React, { useMemo } from "react";

interface AccountProps {
  address: string | null | undefined;
}

function Account({ address }: AccountProps) {
  const truncatedAddress = useMemo(() => {
    if (!address || !address.length) {
      return "NA";
    }
    return `${address.substr(0, 6)}...${address.substr(-4)}`;
  }, [address]);
  return (
    <div className="p-2 rounded-md border">
      <a href={`https://etherscan.io/address/${address}`}>{truncatedAddress}</a>
    </div>
  );
}

export default Account;
