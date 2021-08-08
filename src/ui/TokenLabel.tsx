import React from "react";

export interface TokenProps {
  name?: string | undefined;
  symbol?: string | undefined;
}

function TokenLabel({ name, symbol }: TokenProps) {
  const symbolOrName = symbol || name;
  return (
    <div className="inline">
      <span className="pr-1" title={name}>
        {symbolOrName && symbolOrName.startsWith("WETH") ? "ETH" : symbolOrName}
      </span>
    </div>
  );
}

export default TokenLabel;
