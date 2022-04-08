import React from "react";

export interface TokenProps {
  name?: string | undefined;
  symbol?: string | undefined;
  wrapped?: boolean;
}

function TokenLabel({ name, symbol, wrapped }: TokenProps) {
  const symbolOrName = symbol || name;
  return (
    <div className="inline">
      <span className="pr-1" title={name}>
        {symbolOrName && symbolOrName.startsWith("WETH") && !wrapped
          ? "ETH"
          : symbolOrName}
      </span>
    </div>
  );
}

export default TokenLabel;
