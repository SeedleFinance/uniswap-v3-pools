import { useState, useEffect } from 'react';
import type { NextPage } from 'next';

import Input from '../../components/Input';
import { useRouter } from 'next/router';
import { ROUTES } from '../../common/constants';
import { useAddress } from '../../providers/AddressProvider';

const LandingLayout: NextPage = () => {
  const router = useRouter();
  const [addresses, setAddresses] = useState<string[]>([]);

  const handleInput = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = ev.target;
    const parts = value.split(' ');
    setAddresses(parts);
  };

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    let parts = addresses.slice(0, 10).map((address) => `addr=${address}`);
    let path = `${ROUTES.HOME}?${parts.join('&').replace(/,/g, '')}`;

    router.push(path);
  };

  return (
    <div className="flex flex-col items-center py-4 mx-auto lg:container p-4 h-full">
      <div className="flex flex-col items-center justify-center md:px-4 py-4 mx-auto flex-1 w-full md:mt-8">
        <h1 className="text-center text-high text-2 sm:text-3 lg:text-4.75 font-bold leading-tight tracking-tighter">
          Powerful Insights for <br />
          Uniswap positions
        </h1>
        <form
          onSubmit={handleSubmit}
          className="my-4 flex items-center justify-center w-full md:w-1/2"
        >
          <Input
            className="text-center w-full"
            size="xl"
            value={addresses.join(' ')}
            onChange={handleInput}
            placeholder="Enter any ENS name or Ethereum address"
          />
        </form>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start my-4 w-full flex-1">
        <div className="w-full lg:max-w-sm sm:mr-4 px-8 py-16 rounded-lg flex items-center text-center justify-center flex-col text-high bg-gradient-to-b from-surface-10 to-transparent">
          <h3 className="text-1.5 lg:text-2 font-semibold tracking-tighter">Deep Insights</h3>
          <span>Compare performance across multiple pools at once.</span>
        </div>
        <div className="w-full lg:max-w-sm sm:mr-4 px-8 mt-6 md:mt-0 py-16 rounded-lg flex items-center text-center justify-center flex-col text-high bg-gradient-to-b from-surface-10 to-transparent">
          <h3 className="text-1.5 lg:text-2 font-semibold tracking-tighter">Multi Network</h3>
          <span>Seedle supports Ethereum, Polygon, Optimism and Abritrum.</span>
        </div>
        <div className="w-full lg:max-w-sm px-8 py-16 mt-6 md:mt-0 rounded-lg flex items-center text-center justify-center flex-col text-high bg-gradient-to-b from-surface-10 to-transparent">
          <h3 className="text-1.5 lg:text-2 font-semibold tracking-tighter">Future Proof</h3>
          <span>We’re developing Seedle to be the best in–class defi pool manager.</span>
        </div>
      </div>
    </div>
  );
};

export default LandingLayout;
