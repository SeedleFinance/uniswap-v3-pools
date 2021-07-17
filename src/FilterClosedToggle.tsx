import React from "react";

import { useAppSettings } from "./AppSettingsProvider";
import Toggle from "./ui/Toggle";

function FilterClosedToggle() {
  const { filterClosed, setFilterClosed } = useAppSettings();
  return (
    <div className="p-2 bg-gray-100 rounded">
      <Toggle
        label="Closed positions"
        onChange={() => setFilterClosed(!filterClosed)}
        checked={!filterClosed}
      />
    </div>
  );
}

export default FilterClosedToggle;
