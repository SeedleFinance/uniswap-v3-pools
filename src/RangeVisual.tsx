import React from "react";

interface RangeVisualProps {
  tickCurrent: number;
  tickLower: number;
  tickUpper: number;
  tickSpacing: number;
  flip: boolean;
}

function RangeVisual({
  tickCurrent,
  tickLower,
  tickUpper,
  tickSpacing,
  flip,
}: RangeVisualProps) {
  const spacing = tickSpacing * 100;
  let spaceMultiplier = 10;
  if (tickSpacing === 200) {
    spaceMultiplier = 10;
  } else if (tickSpacing === 10) {
    spaceMultiplier = 2;
  }
  let rangeStart = tickCurrent - spacing * spaceMultiplier;
  let rangeEnd = tickCurrent + spacing * spaceMultiplier;

  if (rangeStart > rangeEnd || flip) {
    [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
  }

  const barWidth = 250;
  const scale = barWidth / (rangeEnd - rangeStart);
  const beforeRangeWidth = Math.abs((tickLower - rangeStart) * scale);
  const rangeWidth = Math.abs((tickUpper - tickLower) * scale);
  const afterRangeWidth = Math.abs((rangeEnd - tickUpper) * scale);
  const currentTickDistance = Math.abs((tickCurrent - rangeStart) * scale);

  return (
    <div
      className="flex border rounded bg-gray-200"
      style={{ position: "relative", width: `${barWidth}px`, height: "16px" }}
    >
      <div
        className="bg-blue-400"
        style={{
          position: "absolute",
          height: "14px",
          left: `${beforeRangeWidth}px`,
          width: `${rangeWidth.toFixed(2)}px`,
        }}
      ></div>
      <div
        className="bg-red-400"
        style={{
          width: "2px",
          height: "14px",
          position: "absolute",
          left: `${currentTickDistance.toFixed(2)}px`,
        }}
      ></div>
    </div>
  );
}

export default RangeVisual;
