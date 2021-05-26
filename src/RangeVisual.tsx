import React from "react";

interface RangeVisualProps {
  tickCurrent: number;
  tickLower: number;
  tickUpper: number;
}

function RangeVisual({ tickCurrent, tickLower, tickUpper }: RangeVisualProps) {
  const minTick = Math.min(tickLower, tickUpper);
  const maxTick = Math.max(tickLower, tickUpper);

  const rangeStart = minTick / 3;
  const rangeEnd = maxTick * 3;

  const cssWidth = 250;
  const scale = cssWidth / (rangeEnd - rangeStart);
  const beforeRangeWidth = Math.abs((minTick - rangeStart) * scale);
  const rangeWidth = Math.abs((maxTick - minTick) * scale);
  const afterRangeWidth = Math.abs((rangeEnd - maxTick) * scale);
  const currentTickDistance = Math.min(
    (tickCurrent - rangeStart) * scale,
    cssWidth
  );

  return (
    <div
      className="flex"
      style={{ position: "relative", width: `${cssWidth}px`, height: "16px" }}
    >
      <div
        className="bg-gray-300"
        style={{ width: `${beforeRangeWidth}px` }}
      ></div>
      <div className="bg-blue-400" style={{ width: `${rangeWidth}px` }}></div>
      <div
        className="bg-gray-300"
        style={{ width: `${afterRangeWidth}px` }}
      ></div>
      <div
        className="bg-red-400"
        style={{
          width: "2px",
          height: "16px",
          position: "absolute",
          left: `${currentTickDistance}px`,
        }}
      ></div>
    </div>
  );
}

export default RangeVisual;
