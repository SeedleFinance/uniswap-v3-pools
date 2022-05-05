import React from 'react';

interface Props {
  fee: number;
  selected: boolean;
  onClick: () => void;
  tabIndex?: number;
}

function FeeButton({ fee, selected, onClick, tabIndex }: Props) {
  return (
    <button
      onClick={onClick}
      className={`p-2 my-1 mr-1 border rounded border-slate-400 focus:outline-none focus:border-blue-500 ${
        selected ? 'border-blue-400 bg-blue-100 dark:border-slate-600 dark:bg-slate-700' : ''
      }`}
      tabIndex={tabIndex || 0}
    >
      {fee}%
    </button>
  );
}

export default FeeButton;
