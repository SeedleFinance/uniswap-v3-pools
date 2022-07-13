import React from 'react';
import classNames from 'classnames';
import { Position } from '@uniswap/v3-sdk';

import { getPositionStatus, PositionStatus } from '../../../utils/positionStatus';

interface PositionStatusesProps {
  tickCurrent: number;
  positions: Position[];
}

function PositionStatuses({ tickCurrent, positions }: PositionStatusesProps) {
  const statusColor = {
    [PositionStatus.Inactive]: 'bg-surface-40',
    [PositionStatus.InRange]: 'bg-brand-primary',
    [PositionStatus.OutRange]: 'bg-yellow-500',
  };
  if (!positions) {
    return null;
  }

  return (
    <>
      {positions.map((position, idx) => (
        <div
          key={idx}
          className={classNames(
            `${statusColor[getPositionStatus(tickCurrent, position)]}`,
            `w-3 h-3 md:w-4 md:h-4 rounded-full mx-0.5 md:mx-1`,
          )}
        />
      ))}
    </>
  );
}

export default PositionStatuses;
