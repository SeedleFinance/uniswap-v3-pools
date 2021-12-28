import React from "react";

function Footer() {
  return (
    <footer className="my-5 flex w-full justify-center">
      <div className="text-sm">
        Built by{" "}
        <a className="text-blue-500" href="https://twitter.com/laktek">
          laktek.eth
        </a>{" "}
        |{" "}
        <a className="text-blue-500" href="https://twitter.com/seedleFinance">
          Twitter
        </a>{" "}
        |{" "}
        <a
          className="text-blue-500"
          href="https://github.com/laktek/uniswap-v3-pools"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}

export default Footer;
