import React from "react";

interface RangeVisualProps {
  tickCurrent: number;
  tickLower: number;
  tickUpper: number;
  tickSpacing: number;
}

function RangeVisual({
  tickCurrent,
  tickLower,
  tickUpper,
  tickSpacing,
}: RangeVisualProps) {
  const minTick = Math.min(tickLower, tickUpper);
  const maxTick = Math.max(tickLower, tickUpper);

  const spacing = tickSpacing / 100;
  let spaceMultiplier = 2;
  if (tickSpacing === 200) {
    spaceMultiplier = 1;
  } else if (tickSpacing === 10) {
    spaceMultiplier = 5;
  }
  const rangeStart = tickCurrent - spacing * spaceMultiplier;
  const rangeEnd = tickCurrent + spacing * spaceMultiplier;

  const barWidth = 250;
  const scale = barWidth / (rangeEnd - rangeStart);
  const beforeRangeWidth = Math.abs((minTick - rangeStart) * scale);
  const rangeWidth = Math.abs((maxTick - minTick) * scale);
  const afterRangeWidth = Math.abs((rangeEnd - maxTick) * scale);
  const currentTickDistance = Math.min(
    Math.abs((tickCurrent - rangeStart) * scale),
    barWidth
  );

  return (
    <div
      className="flex border rounded"
      style={{ position: "relative", width: `${barWidth}px`, height: "16px" }}
    >
      <div
        className="bg-gray-200"
        style={{ width: `${beforeRangeWidth}px` }}
      ></div>
      <div className="bg-blue-400" style={{ width: `${rangeWidth}px` }}></div>
      <div
        className="bg-gray-200"
        style={{ width: `${afterRangeWidth}px` }}
      ></div>
      <div
        className="bg-red-400"
        style={{
          width: "2px",
          height: "14px",
          position: "absolute",
          left: `${currentTickDistance}px`,
        }}
      ></div>
    </div>
  );
}

export default RangeVisual;
