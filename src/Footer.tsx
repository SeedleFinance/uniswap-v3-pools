import React from 'react';

function Footer() {
  return (
    <footer className="my-16 flex w-full justify-center text-gray-600 dark:text-gray-300 text-center">
      <div className="text-sm">
        Built by{' '}
        <a className="text-blue-500" href="https://twitter.com/laktek">
          laktek.eth
        </a>{' '}
        |{' '}
        <a className="text-blue-500" href="https://twitter.com/seedleFinance">
          Twitter
        </a>{' '}
        |{' '}
        <a className="text-blue-500" href="https://github.com/laktek/uniswap-v3-pools">
          GitHub
        </a>{' '}
        |{' '}
        <a className="text-blue-500" href="https://gitcoin.co/grants/4385/seedle-finance">
          Donate
        </a>{' '}
        |{' '}
        <a className="text-blue-500" href="https://seedle.frill.co">
          Suggest a feature
        </a>
      </div>
    </footer>
  );
}

export default Footer;
