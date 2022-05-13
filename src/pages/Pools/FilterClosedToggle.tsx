import React from 'react';

import { useAppSettings } from '../../AppSettingsProvider';
import Toggle from '../../ui/Toggle';

function FilterClosedToggle() {
  const { filterClosed, setFilterClosed } = useAppSettings();
  return (
    <div className="p-2 rounded">
      <Toggle
        label="Show closed positions"
        onChange={() => setFilterClosed(!filterClosed)}
        checked={!filterClosed}
      />
    </div>
  );
}

export default FilterClosedToggle;
