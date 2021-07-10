import React, { useMemo, useState } from "react";
import { Token } from "@uniswap/sdk-core";

import { Pool } from "@uniswap/v3-sdk";

import Position from "./Position";

interface Props {
  positions: any[];
  pool: Pool;
  quoteToken: Token;
}

function Positions({ positions, pool, quoteToken }: Props) {
  const [showClosedPositions, setShowClosedPositions] = useState(true);

  const filteredPositions = useMemo(() => {
    if (showClosedPositions) {
      return positions;
    }

    return positions.filter(
      (pos) => pos.positionLiquidity && !pos.positionLiquidity.equalTo(0)
    );
  }, [showClosedPositions, positions]);

  return (
    <>
      <table className="table-auto w-full">
        <thead>
          <tr className="text-left">
            <th className="pb-4">Range</th>
            <th className="pb-4">Distribution</th>
            <th className="pb-4">Age</th>
            <th className="pb-4">Liquidity</th>
            <th className="pb-4">Uncl. fees</th>
            <th className="pb-4">Total</th>
            <th className="pb-4">
              <span
                style={{ borderBottom: "1px dotted", cursor: "help" }}
                title="liquidity gain + fees - gas cost"
              >
                Net Return
              </span>
            </th>
            <th className="pb-4">
              <span
                style={{ borderBottom: "1px dotted", cursor: "help" }}
                title="Annual Percentage Return"
              >
                APR
              </span>
            </th>
            <th className="pb-4"></th>
          </tr>
        </thead>
        <tbody>
          {filteredPositions.map((position) => (
            <Position
              key={position.id.toString()}
              pool={pool}
              quoteToken={quoteToken}
              {...position}
            />
          ))}
        </tbody>
      </table>

      {positions.length > 1 && (
        <div>
          <label>
            <input
              type="checkbox"
              onChange={() => setShowClosedPositions(!showClosedPositions)}
              checked={!showClosedPositions}
            />
            <span className="ml-1">Hide closed positions</span>
          </label>
        </div>
      )}
    </>
  );
}

export default Positions;
