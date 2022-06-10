import React from 'react';
import { EXTERNAL_LINKS } from './constants';

import Github from './icons/Github';
import Twitter from './icons/Twitter';

function Footer() {
  return (
    <footer className="my-8 flex justify-between items-center w-full text-0.9375 text-high">
      <div className="my-2">
        <div className="flex font-medium">
          <div>
            <a className="" href={EXTERNAL_LINKS.ABOUT}>
              About
            </a>
          </div>
          <div className="pl-8">
            <a className="" href={EXTERNAL_LINKS.GITCOIN}>
              Donate
            </a>
          </div>
          <div className="pl-8">
            <a className="" href={EXTERNAL_LINKS.ROADMAP}>
              Roadmap
            </a>
          </div>
        </div>
        <span className="text-0.75 text-low">Copyright 2022</span>
      </div>
      <div className="flex">
        <a href={EXTERNAL_LINKS.TWITTER}>
          <Twitter />
        </a>
        <a href={EXTERNAL_LINKS.GITHUB} className="ml-2">
          <Github />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
