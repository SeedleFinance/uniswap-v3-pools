import React, { useMemo, useState } from 'react';
import { faCaretDown, faSun, faMoon, faDesktop } from '@fortawesome/free-solid-svg-icons';

import { useAppSettings } from './AppSettingsProvider';
import Icon from './ui/Icon/Icon';
import SunIcon from './icons/Sun';
import MoonIcon from './icons/Moon';
import { Button } from './ui/Button';

function ThemeSelector() {
  const { theme, setTheme } = useAppSettings();

  const computedTheme = useMemo(() => {
    if (theme === '') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  function handleClickToggleTheme() {
    setTheme((prevState: string) => (prevState === 'dark' ? 'light' : 'dark'));
  }

  return (
    <div className="border border-element-10 p-0 rounded-md mr-1">
      <Button onClick={handleClickToggleTheme} variant="ghost">
        {computedTheme === 'light' ? <SunIcon /> : <MoonIcon />}
      </Button>
    </div>
  );
}

export default ThemeSelector;
