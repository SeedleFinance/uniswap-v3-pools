import React from "react";

export interface TokenProps {
  name: string | undefined;
  symbol: string | undefined;
}

function Token({ name, symbol }: TokenProps) {
  return (
    <div className="inline">
      <span className="pr-1">{symbol}</span>
      <span>({name})</span>
    </div>
  );
}

export default Token;
