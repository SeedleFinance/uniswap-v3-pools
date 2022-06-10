import React from 'react';
import { Position } from '@uniswap/v3-sdk';

import { getPositionStatus, PositionStatus } from '../../utils/positionStatus';
import classNames from 'classnames';

interface PositionStatusesProps {
  tickCurrent: number;
  positions: Position[] | undefined;
  onClick: () => void;
}

function PositionStatuses({ tickCurrent, positions, onClick }: PositionStatusesProps) {
  const statusColor = {
    [PositionStatus.Inactive]: 'bg-gray-500',
    [PositionStatus.InRange]: 'bg-brand-primary',
    [PositionStatus.OutRange]: 'bg-yellow-500',
  };
  if (!positions) {
    return null;
  }

  return (
    <button className="flex flex-wrap text-2xl" onClick={onClick}>
      {positions.map((position, idx) => (
        <div
          key={idx}
          className={classNames(
            `${statusColor[getPositionStatus(tickCurrent, position)]}`,
            `w-5 h-5 rounded-full mx-1`,
          )}
        />
      ))}
    </button>
  );
}

export default PositionStatuses;
