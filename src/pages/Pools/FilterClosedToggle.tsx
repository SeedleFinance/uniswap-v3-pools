import React from "react";

import { useAppSettings } from "../../AppSettingsProvider";
import Toggle from "../../ui/Toggle";

function FilterClosedToggle() {
  const { filterClosed, setFilterClosed } = useAppSettings();
  return (
    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
      <Toggle
        label="Closed positions"
        onChange={() => setFilterClosed(!filterClosed)}
        checked={!filterClosed}
      />
    </div>
  );
}

export default FilterClosedToggle;
