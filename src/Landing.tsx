import React, { useState } from "react";
import { useWeb3React } from "@web3-react/core";

import { injectedConnector } from "./utils/connectors";
import Footer from "./Footer";
import { Button } from "./ui/Button";

function Landing() {
  const { activate } = useWeb3React("injected");
  const [addresses, setAddresses] = useState<string[]>([]);

  const handleInput = (ev: { target: any }) => {
    const { value } = ev.target;
    const parts = value.split(" ");
    setAddresses(parts);
  };

  const handleSubmit = (ev: any) => {
    ev.preventDefault();

    const url = new URL(window.location.href);

    const parts = addresses.slice(0, 10).map((address) => `addr=${address}`);
    url.search = `?${parts.join("&")}`;

    window.location.href = url.href;
  };

  const handleConnectWallet = () => {
    activate(injectedConnector, (err) => {
      console.error(err);
    });
  };

  return (
    <div className="h-screen flex flex-col items-center">
      <h2 className="flex flex-col items-center text-3xl font-bold my-16">
        <img
          alt="Seedle logo - a seedling"
          src={new URL("../public/icon128.png", import.meta.url)}
          className="my-4"
        />
        <div className="text-6xl text-slate-800 dark:text-slate-100 mb-4">
          Seedle
        </div>
        <div className="text-2xl text-slate-400 text-center">
          Track performance of Uniswap V3 Positions
        </div>
      </h2>

      <form
        onSubmit={handleSubmit}
        className="m-4 my flex items-center justify-center w-1/2"
      >
        <input
          className="text-xl text-slate-800 bg-white dark:bg-slate-200 p-2 border rounded-md mx-2 w-4/5 focus:outline-none focus:border-gray-800"
          type="text"
          placeholder="Enter an Ethereum address or ENS name"
          value={addresses.join(" ")}
          onChange={handleInput}
        />
        <Button onClick={handleSubmit}>Go</Button>
      </form>
      {addresses.length > 0 && (
        <div className="mb-4 text-sm text-center text-gray-500 dark:text-gray-300">
          Tip: You can enter multiple addresses separated by spaces
        </div>
      )}

      <button
        className="text-center text-md text-gray-600 dark:text-gray-300 underline underline-offset-4 decoration-dotted"
        onClick={handleConnectWallet}
      >
        or connect your Metamask wallet.
      </button>
      <Footer />
    </div>
  );
}

export default Landing;
