import { useMemo } from 'react';
import classNames from 'classnames';
import { Position } from '@uniswap/v3-sdk';
import JSBI from 'jsbi';

import { getPositionStatus, PositionStatus } from '../../utils/positionStatus';

interface PositionStatusesProps {
  tickCurrent: number;
  positions: any[];
}

function PositionStatuses({ tickCurrent, positions }: PositionStatusesProps) {
  const statusColor = {
    [PositionStatus.Inactive]: 'bg-surface-40',
    [PositionStatus.InRange]: 'bg-brand-primary',
    [PositionStatus.OutRange]: 'bg-yellow-500',
  };

  const activePositions = useMemo(() => {
    if (!positions) {
      return [];
    }

    return positions.filter(({ liquidity }) => JSBI.notEqual(liquidity, JSBI.BigInt(0)));
  }, [positions]);

  const status = (position: Position) => getPositionStatus(tickCurrent, position);

  if (!positions) {
    return null;
  }

  const closedPositionCount = positions.length - activePositions.length;

  return (
    <div className="flex justify-end items-center">
      {closedPositionCount > 0 && (
        <div className="text-0.75 font-medium text-low mr-2">{closedPositionCount} Closed</div>
      )}
      {activePositions.map((position, idx) => (
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
    </div>
  );
}

export default PositionStatuses;
