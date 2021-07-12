import React from "react";

import { useAppSettings } from "./AppSettingsProvider";

function FilterClosedToggle() {
  const { filterClosed, setFilterClosed } = useAppSettings();
  return (
    <div>
      <label>
        <input
          type="checkbox"
          onChange={() => setFilterClosed(!filterClosed)}
          checked={filterClosed}
        />
        <span className="ml-1">Hide closed positions</span>
      </label>
    </div>
  );
}

export default FilterClosedToggle;
