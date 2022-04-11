import React, { useState } from "react";

interface Props {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function PeriodButton({ label, selected, onClick }: PeriodButtonProps) {
  return (
    <button
      className={`py-1 px-2  ${
        selected ? "border-b-4 border-slate-400" : "pb-2"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

interface Props {
  current: number;
  onSelect: (value: number) => void;
}

function ChartPeriodSelector({ current, onSelect }: Props) {
  return (
    <div className="w-full flex justify-end">
      <div className="flex justify-between border rounded border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-400 p-2">
        <PeriodButton
          label="24h"
          onClick={() => onSelect(0)}
          selected={current === 0}
        />
        <PeriodButton
          label="7d"
          onClick={() => onSelect(7)}
          selected={current === 7}
        />
        <PeriodButton
          label="14d"
          onClick={() => onSelect(14)}
          selected={current === 14}
        />
        <PeriodButton
          label="30d"
          onClick={() => onSelect(30)}
          selected={current === 30}
        />
        <PeriodButton
          label="90d"
          onClick={() => onSelect(90)}
          selected={current === 90}
        />
        <PeriodButton
          label="180d"
          onClick={() => onSelect(180)}
          selected={current === 180}
        />
        <PeriodButton
          label="1y"
          onClick={() => onSelect(365)}
          selected={current === 365}
        />
      </div>
    </div>
  );
}

export default ChartPeriodSelector;
