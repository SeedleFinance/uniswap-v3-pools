import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import JSBI from "jsbi";
import { BigNumber } from "@ethersproject/bignumber";
import { Token, MaxUint256 } from "@uniswap/sdk-core";

const Q128 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(128));
function multiplyIn256(a: JSBI, b: JSBI): JSBI {
  const c = JSBI.multiply(a, b);
  return JSBI.bitwiseAnd(c, MaxUint256);
}

const QUERY_POSITIONS = gql`
  query positionsByOwner($accounts: [String]!) {
    positions(where: { owner_in: $accounts }) {
      id
      token0 {
        id
        decimals
        symbol
        name
      }
      token1 {
        id
        decimals
        symbol
        name
      }
      pool {
        feeTier
        tick
        feeGrowthGlobal0X128
        feeGrowthGlobal1X128
      }
      tickLower {
        tickIdx
        feeGrowthOutside0X128
        feeGrowthOutside1X128
      }
      tickUpper {
        tickIdx
        feeGrowthOutside0X128
        feeGrowthOutside1X128
      }
      liquidity
      feeGrowthInside0LastX128
      feeGrowthInside1LastX128
    }
  }
`;

export interface PositionState {
  id: BigNumber;
  token0: Token;
  token1: Token;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: BigNumber;
  fees: { amount0: BigNumber; amount1: BigNumber };
}

export function useQueryPositions(
  chainId: number,
  accounts: string[]
): PositionState[] {
  const { loading, error, data } = useQuery(QUERY_POSITIONS, {
    variables: { accounts },
    fetchPolicy: "network-only",
  });

  if (loading || error || !data) {
    return [];
  }

  const { positions } = data;
  return positions.map((position: any) => {
    const id = BigNumber.from(position.id);
    const token0 = new Token(
      chainId,
      position.token0.id,
      parseInt(position.token0.decimals, 10),
      position.token0.symbol,
      position.token0.name
    );
    const token1 = new Token(
      chainId,
      position.token1.id,
      parseInt(position.token1.decimals, 10),
      position.token1.symbol,
      position.token1.name
    );
    const fee = parseInt(position.pool.feeTier, 10);
    const tickLower = parseInt(position.tickLower.tickIdx, 10);
    const tickUpper = parseInt(position.tickUpper.tickIdx, 10);
    const liquidity = JSBI.BigInt(position.liquidity);
    const currentTick = parseInt(position.pool.tick, 10);

    const feeGrowthGlobal0X128 = JSBI.BigInt(
      position.pool.feeGrowthGlobal0X128
    );
    const feeGrowthGlobal1X128 = JSBI.BigInt(
      position.pool.feeGrowthGlobal1X128
    );

    let fa0, fa1;
    if (currentTick < tickUpper) {
      fa0 = JSBI.BigInt(position.tickUpper.feeGrowthOutside0X128);
      fa1 = JSBI.BigInt(position.tickUpper.feeGrowthOutside1X128);
    } else {
      fa0 = JSBI.subtract(
        feeGrowthGlobal0X128,
        JSBI.BigInt(position.tickUpper.feeGrowthOutside0X128)
      );
      fa1 = JSBI.subtract(
        feeGrowthGlobal1X128,
        JSBI.BigInt(position.tickUpper.feeGrowthOutside1X128)
      );
    }

    let fb0, fb1;
    if (currentTick >= tickLower) {
      fb0 = JSBI.BigInt(position.tickLower.feeGrowthOutside0X128);
      fb1 = JSBI.BigInt(position.tickLower.feeGrowthOutside1X128);
    } else {
      fb0 = JSBI.subtract(
        feeGrowthGlobal0X128,
        JSBI.BigInt(position.tickLower.feeGrowthOutside0X128)
      );
      fb1 = JSBI.subtract(
        feeGrowthGlobal1X128,
        JSBI.BigInt(position.tickLower.feeGrowthOutside1X128)
      );
    }

    const fr0 = JSBI.subtract(JSBI.subtract(feeGrowthGlobal0X128, fb0), fa0);
    const fr1 = JSBI.subtract(JSBI.subtract(feeGrowthGlobal1X128, fb1), fa1);

    const feeGrowthInside0Last = JSBI.BigInt(position.feeGrowthInside0LastX128);
    const feeGrowthInside1Last = JSBI.BigInt(position.feeGrowthInside1LastX128);

    let amount0 = JSBI.divide(
      multiplyIn256(JSBI.subtract(fr0, feeGrowthInside0Last), liquidity),
      Q128
    );
    let amount1 = JSBI.divide(
      multiplyIn256(JSBI.subtract(fr1, feeGrowthInside1Last), liquidity),
      Q128
    );

    const fees = { amount0, amount1 };

    return {
      id,
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity: BigNumber.from(liquidity.toString()),
      fees,
    };
  });
}
