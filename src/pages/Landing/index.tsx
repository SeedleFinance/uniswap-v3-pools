import React, { useState } from 'react';
import { useWeb3React } from '@web3-react/core';

import { injectedConnector } from '../../utils/connectors';
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

  const handleConnectWallet = () => {
    activate(injectedConnector, (err) => {
      console.error(err);
    });
  };

  return (
    <div className="h-screen flex flex-col items-center py-4 mx-auto lg:container">
      <div className="w-full py-4 mb-4 flex justify-between">
        <h2 className="flex items-center text-3xl font-bold text-slate-800 dark:text-slate-100">
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
        <h2 className="flex flex-col items-center text-3xl font-bold my-4">
          <div className="text-6xl text-slate-900 text-center">
            Track performance <br />
            of Uniswap V3 Positions
          </div>
        </h2>
        <form onSubmit={handleSubmit} className="m-4 my flex items-center justify-center w-1/2">
          <Input
            className="text-xl text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 p-2 border border-slate-200 dark:border-slate-700 rounded-md mx-2 md:w-4/5 focus:outline-none focus:border-slate-800 dark:focus:border-slate-400"
            size="xl"
            value={addresses.join(' ')}
            onChange={handleInput}
            placeholder="Enter any ENS name or Ethereum address"
          />
        </form>

        <Footer />
      </div>
    </div>
  );
}

export default Landing;
