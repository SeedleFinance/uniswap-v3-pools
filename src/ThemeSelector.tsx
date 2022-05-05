import React, { useMemo, useState } from 'react';
import { faCaretDown, faSun, faMoon, faDesktop } from '@fortawesome/free-solid-svg-icons';

import { useAppSettings } from './AppSettingsProvider';
import Icon from './ui/Icon';
import Menu from './ui/Menu';

function ThemeSelector() {
  const { theme, setTheme } = useAppSettings();
  const [selectorExpanded, setSelectorExpanded] = useState(false);

  const computedTheme = useMemo(() => {
    if (theme === '') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  const handleSelection = (val: string) => {
    setTheme(val);
    setSelectorExpanded(false);
  };

  return (
    <div className="p-2 mx-1 md:mx-2 rounded-md border border-slate-200 dark:border-slate-700 relative text-gray-800 dark:text-slate-200 flex flex-shrink-0">
      <button
        className="flex items-center focus:outline-none"
        onClick={() => setSelectorExpanded(!selectorExpanded)}
      >
        <Icon className="text-xl" size="sm" icon={computedTheme === 'light' ? faSun : faMoon} />
        <Icon className="pl-1 text-xl" icon={faCaretDown} />
      </button>

      {selectorExpanded && (
        <Menu onClose={() => setSelectorExpanded(false)} className="top-12 left-0 w-32">
          <button
            className="flex items-center justify-between w-24 my-1"
            onClick={() => handleSelection('light')}
          >
            <Icon size="sm" className="w-1/5 mr-2" icon={faSun} />
            <span className="w-4/5 text-left">Light</span>
          </button>
          <button
            className="flex items-center justify-between w-24 my-1"
            onClick={() => handleSelection('dark')}
          >
            <Icon size="sm" className="w-1/5 mr-2" icon={faMoon} />
            <span className="w-4/5 text-left">Dark</span>
          </button>
          <button
            className="flex items-center justify-between w-24 my-1"
            onClick={() => handleSelection('')}
          >
            <Icon size="sm" className="w-1/5 mr-2" icon={faDesktop} />
            <span className="w-4/5 text-left">System</span>
          </button>
        </Menu>
      )}
    </div>
  );
}

export default ThemeSelector;
