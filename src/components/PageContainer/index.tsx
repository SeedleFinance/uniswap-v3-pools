import React, { useState } from "react";

import { useAddress } from "../../providers/AddressProvider";
import { ROUTES } from "../../common/constants";

import Logo from "../Logo";
import Footer from "../Footer";
import ThemeSelector from "../ThemeSelector";
import GlobalCurrencySelector from "../GlobalCurrencySelector";
import Account from "../Account";

function PageContainer({ children }: { children: React.ReactNode }) {
  const { addressReady } = useAddress();

  return (
    <div className="h-full lg:container mx-auto pb-4 p-4  flex flex-col items-stretch">
      <div className="w-full py-4 mb-1 md:mb-8 flex justify-between items-center">
        <a href={ROUTES.HOME}>
          <Logo />
        </a>
        <div className="flex justify-end gap-1 md:gap-2">
          <ThemeSelector />
          {addressReady && <GlobalCurrencySelector />}
          <Account />
        </div>
      </div>
      {children}
      <Footer />
    </div>
  );
}

export default PageContainer;
