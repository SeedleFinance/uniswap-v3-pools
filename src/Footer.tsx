import React from 'react';

function Footer() {
  return (
    <footer className="my-16 flex flex-col md:flex-row w-full justify-center text-high text-center text-0.875">
      <div className="px-4">
        <a className="" href="https://twitter.com/seedleFinance">
          Twitter
        </a>
      </div>
      <div className="px-4">
        <a className="" href="https://github.com/laktek/uniswap-v3-pools">
          GitHub
        </a>
      </div>
      <div className="px-4">
        <a className="" href="https://gitcoin.co/grants/4385/seedle-finance">
          Donate
        </a>
      </div>
      <div className="px-4">
        <a className="" href="https://seedle.frill.co">
          Roadmap
        </a>
      </div>
    </footer>
  );
}

export default Footer;
