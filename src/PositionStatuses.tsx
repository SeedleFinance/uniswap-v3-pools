import React from "react";

import {
  getPositionStatus,
  PositionFields,
  PositionStatus,
} from "./utils/positionStatus";

interface PositionStatusesProps {
  tickCurrent: number;
  positions: PositionFields[] | undefined;
  onClick: () => void;
}

function PositionStatuses({
  tickCurrent,
  positions,
  onClick,
}: PositionStatusesProps) {
  const statusColor = {
    [PositionStatus.Inactive]: "text-gray-500",
    [PositionStatus.InRange]: "text-green-500",
    [PositionStatus.OutRange]: "text-yellow-500",
  };
  if (!positions) {
    return null;
  }

  return (
    <button className="flex justify-between text-2xl" onClick={onClick}>
      {positions.map((position) => (
        <div
          className={`${
            statusColor[getPositionStatus(tickCurrent, position)]
          } px-1`}
        >
          ●
        </div>
      ))}
    </button>
  );
}

export default PositionStatuses;
