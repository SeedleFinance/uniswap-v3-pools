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
            <a href={EXTERNAL_LINKS.GITCOIN} target="_blank" rel="noreferrer">
              Donate
            </a>
          </div>
          <div className="pl-8">
            <a href={EXTERNAL_LINKS.ROADMAP} target="_blank" rel="noreferrer">
              Roadmap
            </a>
          </div>
        </div>
        <span className="text-0.75 text-low">Copyright 2022</span>
      </div>
      <div className="flex">
        <a href={EXTERNAL_LINKS.TWITTER} target="_blank" rel="noreferrer">
          <Twitter />
        </a>
        <a href={EXTERNAL_LINKS.GITHUB} className="ml-2" target="_blank" rel="noreferrer">
          <Github />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
