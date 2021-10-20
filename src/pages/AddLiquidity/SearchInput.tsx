import React from "react";

interface Props {
  onChange: (value: string) => void;
}

function SearchInput({ onChange }: Props) {
  const handleInput = (ev: { target: any }) => {
    const { value } = ev.target;
    onChange(value);
  };

  return (
    <input
      className="w-full rounded border border-gray-200 p-2 focus:outline-none focus:border-gray-500"
      type="text"
      placeholder="Search by tokens"
      onChange={handleInput}
    />
  );
}

export default SearchInput;
