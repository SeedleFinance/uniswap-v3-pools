import React from 'react';

import { useAppSettings } from '../../providers/AppSettingsProvider';
import Toggle from '../../components/Toggle';

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
