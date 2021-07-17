import React from "react";

import { useAppSettings } from "./AppSettingsProvider";
import Toggle from "./Toggle";

function FilterClosedToggle() {
  const { filterClosed, setFilterClosed } = useAppSettings();
  return (
    <div>
      <Toggle
        label="Closed positions"
        onChange={() => setFilterClosed(!filterClosed)}
        checked={!filterClosed}
      />
    </div>
  );
}

export default FilterClosedToggle;
