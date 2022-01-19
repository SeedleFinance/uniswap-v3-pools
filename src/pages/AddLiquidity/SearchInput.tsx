import React, { useRef } from "react";
import { debounce } from "lodash";

interface Props {
  onChange: (value: string) => void;
}

function SearchInput({ onChange }: Props) {
  const debouncedOnChange = useRef(debounce(onChange, 500)).current;

  const handleInput = (ev: { target: any }) => {
    const { value } = ev.target;
    debouncedOnChange(value);
  };

  return (
    <input
      className="w-full rounded border border-slate-200 dark:border-slate-700 p-2 focus:outline-none focus:border-gray-500 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300"
      type="text"
      placeholder="Search by tokens"
      onChange={handleInput}
    />
  );
}

export default SearchInput;
