import classNames from "classnames";
import React from "react";

interface RangeVisualProps {
  tickCurrent: number;
  tickLower: number;
  tickUpper: number;
  tickSpacing: number;
  flip: boolean;
  className?: string;
}

function RangeVisual({
  tickCurrent,
  tickLower,
  tickUpper,
  tickSpacing,
  flip,
  className,
}: RangeVisualProps) {
  let spaceMultiplier = 10;
  if (tickSpacing === 200) {
    spaceMultiplier = 10;
  } else if (tickSpacing === 10) {
    spaceMultiplier = 2;
  }
  let rangeStart =
    Math.min(tickCurrent, tickLower) - tickSpacing * spaceMultiplier;
  let rangeEnd =
    Math.max(tickCurrent, tickUpper) + tickSpacing * spaceMultiplier;

  if (tickLower < tickCurrent && tickCurrent < tickUpper) {
    rangeStart = tickLower - tickSpacing * spaceMultiplier;
    rangeEnd = tickUpper + tickSpacing * spaceMultiplier;
  }

  if (rangeStart > rangeEnd || flip) {
    [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
    [tickLower, tickUpper] = [tickUpper, tickLower];
  }

  const barWidth = 150;
  const scale = barWidth / (rangeEnd - rangeStart);
  const beforeRangeWidth = Math.abs((tickLower - rangeStart) * scale);
  const rangeWidth = Math.abs((tickUpper - tickLower) * scale);
  const currentTickDistance = Math.abs((tickCurrent - rangeStart) * scale);

  return (
    <div
      className={classNames("flex bg-surface-30", className)}
      style={{ position: "relative", width: `${barWidth}px`, height: "10px" }}
    >
      <div
        className="bg-blue-600"
        style={{
          position: "absolute",
          height: "10px",
          left: `${beforeRangeWidth}px`,
          width: `${rangeWidth.toFixed(2)}px`,
        }}
      ></div>
      <div
        className="bg-red-400"
        style={{
          width: "2px",
          height: "10px",
          position: "absolute",
          left: `${currentTickDistance.toFixed(2)}px`,
        }}
      ></div>
    </div>
  );
}

export default RangeVisual;
