import React, { useState } from "react";

import Footer from "./Footer";
import { Button } from "./ui/Button";

function Landing() {
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

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h2 className="flex flex-col items-center text-3xl font-bold text-gray-600 my-16">
        <img
          alt="Seedle logo - a seedling"
          src="/icon128.png"
          className="my-4"
        />
        <div className="text-6xl text-gray-800 mb-4">Seedle</div>
        <div className="text-2xl text-gray-400 text-center">
          Track the performance of Uniswap V3 Positions
        </div>
      </h2>

      <form
        onSubmit={handleSubmit}
        className="m-4 flex items-center justify-center w-1/2"
      >
        <input
          className="text-xl text-gray-800 p-2 border rounded-md mx-2 w-4/5 focus:outline-none focus:border-gray-800"
          type="text"
          placeholder="Enter an Ethereum address or ENS name"
          value={addresses.join(" ")}
          onChange={handleInput}
        />
        <Button onClick={handleSubmit}>Go</Button>
      </form>
      {addresses.length > 0 && (
        <div className="mb-4 text-sm text-center text-gray-500">
          Tip: You can enter multiple addresses separated by spaces
        </div>
      )}

      <div className="text-center text-md text-gray-600">
        Or connect your Metamask wallet.
      </div>
      <Footer />
    </div>
  );
}

export default Landing;
