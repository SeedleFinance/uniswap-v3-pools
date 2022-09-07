import React, { useRef } from 'react';
import { debounce } from 'lodash';
import Input from '../Input';

interface Props {
  onChange: (value: string) => void;
}

function SearchInput({ onChange }: Props) {
  const debouncedOnChange = useRef(debounce(onChange, 500)).current;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = () => {
    const value = inputRef.current!.value;

    debouncedOnChange(value);
  };

  return <Input ref={inputRef} size="lg" placeholder="Search tokens" onChange={handleInput} />;
}

export default SearchInput;
