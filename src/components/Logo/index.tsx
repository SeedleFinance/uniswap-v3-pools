import React from "react";
import { useAppSettings } from "../../providers/AppSettingsProvider";

import SeedleMark from "./Mark";
import SeedleSymbol from "./Symbol";

const Logo = () => {
  const { theme } = useAppSettings();

  return (
    <div className="flex gap-2 items-center">
      <SeedleSymbol theme={theme} />
      <SeedleMark theme={theme} />
      <span>
        <span className="text-2xl text-white font-bold">v2</span>
      </span>

    </div>
  );
};

export default Logo;
