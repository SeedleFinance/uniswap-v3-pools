import React, { useMemo, useState } from "react";

import { useAppSettings } from "./AppSettingsProvider";

function ThemeSelector() {
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
    <div className="p-2 mx-2 rounded-md border border-slate-200 dark:border-slate-700 relative text-gray-800 dark:text-slate-200">
      <button
        className="focus:outline-none"
        onClick={() => setSelectorExpanded(!selectorExpanded)}
      >
        <span className="text-xl">{computedTheme === "light" ? "☼" : "☾"}</span>
        <span className="pl-1 text-xl">▿</span>
      </button>

      {selectorExpanded && (
        <div className="absolute p-2 rounded-md border border-slate-200 dark:border-slate-700  bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 top-12 left-0">
          <button
            className="flex justify-between w-24 my-1"
            onClick={() => handleSelection("light")}
          >
            <span className="w-1/5 mr-1">☼</span>
            <span className="w-4/5 text-left">Light</span>
          </button>
          <button
            className="flex justify-between w-24 my-1"
            onClick={() => handleSelection("dark")}
          >
            <span className="w-1/5 mr-1">☾</span>
            <span className="w-4/5 text-left">Dark</span>
          </button>
          <button
            className="flex justify-between w-24 my-1"
            onClick={() => handleSelection("")}
          >
            <span className="w-1/5 mr-1">❖</span>
            <span className="w-4/5 text-left">System</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ThemeSelector;
