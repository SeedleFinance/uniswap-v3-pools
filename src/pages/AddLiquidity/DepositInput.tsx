import React, { useState, useEffect, useRef } from "react";
import { Token } from "@uniswap/sdk-core";

import TokenLabel from "../../ui/TokenLabel";
import TokenLogo from "../../ui/TokenLogo";
import { formatInput } from "../../utils/numbers";

interface DepositInputProps {
  token: Token;
  value: number;
  balance: string;
  tabIndex: number;
  disabled: boolean;
  onChange: (value: number) => void;
}

function DepositInput({
  token,
  value,
  balance,
  tabIndex,
  disabled,
  onChange,
}: DepositInputProps) {
  const inputEl = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState<string>("0.00");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const input = formatInput(value, false);
    setInput(input);
  }, [value]);

  const setInputWithDirty = (val: string) => {
    setInput(val);
    setDirty(true);
  };

  const handleInput = (ev: { target: any }) => {
    const val = ev.target.value;
    if (val === "") {
      setInput("0.00");
      return;
    }
    setInputWithDirty(val);
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

  const handleMaxBalance = () => {
    setInputWithDirty(balance);
    if (inputEl.current) {
      inputEl.current.focus();
      window.setTimeout(() => {
        if (inputEl.current) {
          inputEl.current.blur();
          inputEl.current.focus();
        }
      }, 5);
    }
  };

  return (
    <div className="w-full flex flex-wrap items-start border rounded p-2 my-2 relative">
      <div className="w-1/3 flex items-center p-1 my-1 justify-between bg-gray-100 border rounded">
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
        ref={inputEl}
      />
      <div className="w-full text-sm my-1">
        <span>Balance: {balance} </span>
        <TokenLabel name={token.name} symbol={token.symbol} /> (
        <button className="text-blue-500" onClick={handleMaxBalance}>
          Max
        </button>
        )
      </div>
      {disabled && (
        <div className="absolute w-full -m-2 py-4 px-2 h-full bg-white bg-opacity-90">
          <div className="text-sm text-center">
            The market price is outside your specified price range. Single-asset
            deposit only.
          </div>
        </div>
      )}
    </div>
  );
}

export default DepositInput;
