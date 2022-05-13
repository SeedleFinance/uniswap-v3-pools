import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';

import Footer from '../../Footer';
import Input from '../../ui/Input';

import ThemeSelector from '../../ThemeSelector';
import { useAddress } from '../../AddressProvider';
import Account from '../../Account';

function Landing() {
  const { activate } = useWeb3React('injected');
  const [addresses, setAddresses] = useState<string[]>([]);
  const { injectedAddress } = useAddress();

  const handleInput = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = ev.target;
    const parts = value.split(' ');
    setAddresses(parts);
  };

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const url = new URL(window.location.href);

    const parts = addresses.slice(0, 10).map((address) => `addr=${address}`);
    url.search = `?${parts.join('&')}`;

    window.location.href = url.href;
  };

  return (
    <div className="h-screen flex flex-col items-center py-4 mx-auto lg:container">
      <div className="w-full py-4 mb-4 flex justify-between">
        <h2 className="flex items-center text-1.5 font-bold text-high">
          <a className="flex sm:w-3/5" href="https://www.seedle.finance">
            <img
              className="mr-2"
              alt="Seedle logo - a seedling"
              src={new URL('../../../public/icon32.png', import.meta.url).toString()}
            />
            <span className="hidden sm:block">Seedle</span>
          </a>
        </h2>
        <div className="md:w-2/5 flex justify-end">
          <ThemeSelector />
          <Account address={injectedAddress} />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center px-4 mx-auto flex-1 w-full">
        <h1 className="text-center text-high text-4.75 font-bold leading-tight tracking-tighter">
          Track performance <br />
          on Uniswap V3
        </h1>
        <form onSubmit={handleSubmit} className="m-4 my flex items-center justify-center w-1/2">
          <Input
            className="text-center max-w-xl"
            size="xl"
            value={addresses.join(' ')}
            onChange={handleInput}
            placeholder="Enter any ENS name or Ethereum address"
          />
        </form>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default Landing;
