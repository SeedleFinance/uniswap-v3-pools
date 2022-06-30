import React, { useState } from 'react';

import Footer from '../../Footer';
import Input from '../../ui/Input';

import ThemeSelector from '../../ThemeSelector';
import { useAddress } from '../../AddressProvider';
import Account from '../../Account';
import { ROUTES } from '../../constants';
import Logo from '../../ui/Logo';

function Landing() {
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
    <div className="flex flex-col items-center py-4 mx-auto lg:container p-4 h-full">
      <div className="w-full mb-4 flex justify-between py-4">
        <a href={ROUTES.HOME}>
          <Logo />
        </a>
        <div className="md:w-2/5 flex justify-end items-center">
          <ThemeSelector className="mr-1" />
          <Account address={injectedAddress} />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center px-4 mx-auto flex-1 w-full md:mt-8">
        <h1 className="text-center text-high text-2 sm:text-3 lg:text-4.75 font-bold leading-tight tracking-tighter">
          Powerful Insights for <br />
          Uniswap positions
        </h1>
        <form
          onSubmit={handleSubmit}
          className="my-4 flex items-center justify-center w-full md:w-1/2"
        >
          <Input
            className="text-center"
            size="xl"
            value={addresses.join(' ')}
            onChange={handleInput}
            placeholder="Enter any ENS name or Ethereum address"
          />
        </form>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center my-4 w-full flex-1">
        <div className="w-full lg:max-w-sm sm:mr-4 px-8 py-16 rounded-lg flex items-center text-center justify-center flex-col text-high bg-gradient-to-b from-surface-10 to-transparent">
          <h3 className="text-1.5 lg:text-2 font-semibold tracking-tighter">$150M+</h3>
          <span>Over $150M actively managed through Seedle.</span>
        </div>
        <div className="w-full lg:max-w-sm sm:mr-4 px-8 py-16 rounded-lg flex items-center text-center justify-center flex-col text-high bg-gradient-to-b from-surface-10 to-transparent">
          <h3 className="text-1.5 lg:text-2 font-semibold tracking-tighter">Multi Network</h3>
          <span>Seedle supports Ethereum, Polygon, Optimism and Abritrum.</span>
        </div>
        <div className="w-full lg:max-w-sm px-8 py-16 rounded-lg flex items-center text-center justify-center flex-col text-high bg-gradient-to-b from-surface-10 to-transparent">
          <h3 className="text-1.5 lg:text-2 font-semibold tracking-tighter">Future Proof</h3>
          <span>We’re developing Seedle to be the best in–class defi pool manager.</span>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Landing;
