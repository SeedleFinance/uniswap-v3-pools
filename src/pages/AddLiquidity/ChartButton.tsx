import React from 'react';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';

import Icon from '../../ui/Icon';

interface Props {
  selected: boolean;
  onClick: () => void;
}

function ChartButton({ selected, onClick }: Props) {
  return (
    <button
      className={`border rounded-full px-2 py-1 dark:bg-slate-700 ${
        selected ? 'bg-blue-200 dark:bg-slate-500' : 'bg-slate-200 dark:bg-slate-700'
      }`}
      onClick={onClick}
    >
      <Icon className="text-lg" size="sm" icon={faChartLine} />
    </button>
  );
}

export default ChartButton;
