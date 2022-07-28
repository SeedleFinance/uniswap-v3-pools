import { BigNumber } from '@ethersproject/bignumber';
import { Position } from '@uniswap/v3-sdk';

export enum PositionStatus {
  Inactive,
  InRange,
  OutRange,
}
export function getPositionStatus(tickCurrent: number, position: Position): PositionStatus {
  if (!position.liquidity) {
    return PositionStatus.Inactive;
  }

  if (BigNumber.from(position.liquidity.toString()).isZero()) {
    return PositionStatus.Inactive;
  } else {
    return position.tickLower <= tickCurrent && tickCurrent <= position.tickUpper
      ? PositionStatus.InRange
      : PositionStatus.OutRange;
  }
}
