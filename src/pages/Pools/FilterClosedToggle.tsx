import React from 'react';

import { useAppSettings } from '../../AppSettingsProvider';
import Toggle from '../../ui/Toggle';

function FilterClosedToggle() {
  const { filterClosed, setFilterClosed } = useAppSettings();
  return (
    <Toggle
      label="Closed positions"
      onChange={() => setFilterClosed(!filterClosed)}
      checked={!filterClosed}
    />
  );
}

export default FilterClosedToggle;
