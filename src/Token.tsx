import React from "react";

export interface TokenProps {
  name?: string | undefined;
  symbol?: string | undefined;
}

function Token({ name, symbol }: TokenProps) {
  const symbolOrName = symbol || name;
  return (
    <div className="inline">
      <span className="pr-1" title={name}>
        {symbolOrName === "WETH9" ? "ETH" : symbolOrName}
      </span>
    </div>
  );
}

export default Token;
