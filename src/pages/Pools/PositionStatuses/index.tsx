import React from 'react';
import classNames from 'classnames';
import { Position } from '@uniswap/v3-sdk';

import { getPositionStatus, PositionStatus } from '../../../utils/positionStatus';

interface PositionStatusesProps {
  tickCurrent: number;
  positions: any[];
  allPositionsCounter: number;
}

function PositionStatuses({ tickCurrent, positions, allPositionsCounter }: PositionStatusesProps) {
  const statusColor = {
    [PositionStatus.Inactive]: 'bg-surface-40',
    [PositionStatus.InRange]: 'bg-brand-primary',
    [PositionStatus.OutRange]: 'bg-yellow-500',
  };
  if (!positions) {
    return null;
  }

  const status = (position: Position) => getPositionStatus(tickCurrent, position);

  const positionCounter = allPositionsCounter - positions.length;

  return (
    <>
      {positionCounter > 0 && (
        <div className="text-0.75 font-medium text-low mr-2">{positionCounter} Closed</div>
      )}
      {positions.map((position, idx) => (
        <span key={idx}>
          <div
            key={idx}
            className={classNames(
              `${statusColor[status(position)]}`,
              `w-3 h-3 md:w-4 md:h-4 rounded-full mx-0.5 md:mx-1`,
            )}
          />
        </span>
      ))}
    </>
  );
}

export default PositionStatuses;
