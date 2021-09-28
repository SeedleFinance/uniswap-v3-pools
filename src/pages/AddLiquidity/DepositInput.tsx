import React, { useState, useEffect } from "react";
import { Token } from "@uniswap/sdk-core";

import TokenLabel from "../../ui/TokenLabel";
import TokenLogo from "../../ui/TokenLogo";
import { formatInput } from "../../utils/numbers";

interface DepositInputProps {
  token: Token;
  value: number;
  tabIndex: number;
  onChange: (value: number) => void;
}

function DepositInput({ token, value, tabIndex, onChange }: DepositInputProps) {
  const [input, setInput] = useState<string>("0.00");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const input = formatInput(value);
    setInput(input);
  }, [value]);

  const handleInput = (ev: { target: any }) => {
    const { value } = ev.target;
    if (value === "") {
      setInput("0.00");
      return;
    }

    setInput(value);
    setDirty(true);
  };

  const handleBlur = () => {
    if (!dirty) {
      return;
    }

    const valueNum = parseFloat(input);
    if (!Number.isNaN(valueNum)) {
      setDirty(false);
      onChange(valueNum);
    }
  };

  return (
    <div className="flex items-center border rounded p-2 my-2">
      <div className="w-1/3 flex items-center p-1 justify-between bg-gray-100 border rounded">
        <TokenLogo name={token.name} address={token.address} />
        <TokenLabel name={token.name} symbol={token.symbol} />
      </div>
      <input
        className="w-2/3 focus:outline-none text-2xl p-2 text-right"
        type="text"
        value={input}
        tabIndex={tabIndex}
        onChange={handleInput}
        onBlur={handleBlur}
      />
    </div>
  );
}

export default DepositInput;
