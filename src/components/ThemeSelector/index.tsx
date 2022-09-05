import React, { useMemo, useState } from "react";
import classNames from "classnames";

import { useAppSettings } from "../../providers/AppSettingsProvider";

import Menu from "../Menu/Menu";
import Button from "../Button";
import SunIcon from "../icons/Sun";
import MoonIcon from "../icons/Moon";
import SystemIcon from "../icons/SystemIcon";

interface ThemeSelectorProps {
  className?: string;
}

function ThemeSelector({ className }: ThemeSelectorProps) {
  const { theme, setTheme } = useAppSettings();
  const [selectorExpanded, setSelectorExpanded] = useState(false);

  const computedTheme = useMemo(() => {
    if (theme === "") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme;
  }, [theme]);

  const handleSelection = (val: string) => {
    setTheme(val);
    setSelectorExpanded(false);
  };

  return (
    <div className={classNames("relative", className)}>
      <Button
        variant="outline"
        className="flex items-center justify-center focus:outline-none"
        size="lg"
        onClick={() => setSelectorExpanded(!selectorExpanded)}
      >
        {computedTheme === "light" ? <SunIcon /> : <MoonIcon />}
      </Button>

      {selectorExpanded && (
        <Menu
          onClose={() => setSelectorExpanded(false)}
          className="top-12 left-0 w-32 shadow-lg"
        >
          <button
            className="flex items-center justify-between w-24 my-1"
            onClick={() => handleSelection("light")}
          >
            <SunIcon />
            <span className="ml-2 w-4/5 text-left">Light</span>
          </button>
          <button
            className="flex items-center justify-between w-24 my-1"
            onClick={() => handleSelection("dark")}
          >
            <MoonIcon />
            <span className="ml-2 w-4/5 text-left">Dark</span>
          </button>
          <button
            className="flex items-center justify-between w-24 my-1"
            onClick={() => handleSelection("")}
          >
            <SystemIcon />
            <span className="ml-2 w-4/5 text-left">System</span>
          </button>
        </Menu>
      )}
    </div>
  );
}

export default ThemeSelector;
