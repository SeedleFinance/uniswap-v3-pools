import React from 'react';
import { Token } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';

import Position from './Position';

interface Props {
  positions: any[];
  pool: Pool;
  baseToken: Token;
  quoteToken: Token;
}

function Positions({ positions, pool, baseToken, quoteToken }: Props) {
  return (
    <div className="w-full overflow-x-auto flex flex-col my-4 border border-element-10">
      <table className="table-auto w-full text-high text-0.875">
        <thead className="bg-surface-10">
          <tr className="text-left text-0.875 align-middle">
            <th className="pb-4 px-4 py-2">Range</th>
            <th className="pb-4 px-4 py-2">Distribution</th>
            <th className="pb-4 px-4 py-2">Liquidity</th>
            <th className="pb-4 px-4 py-2">Uncl. fees</th>
            <th className="pb-4 px-4 py-2">
              <span
                className="underline underline-offset-1 decoration-dotted cursor-help"
                title="annualized fees earned over liquidity"
              >
                Fee APY
              </span>
            </th>
            <th className="pb-4 px-4 py-2">
              <span
                className="underline underline-offset-1 decoration-dotted cursor-help"
                title="liquidity gain + fees - gas cost"
              >
                Net Return
              </span>
            </th>
            <th className="pb-4 px-4 py-2">
              <span
                style={{ borderBottom: '1px dotted', cursor: 'help' }}
                title="Net Annual Percentage Yield"
              >
                Net APY
              </span>
            </th>
            <th className="pb-4 px-4 py-2"></th>
          </tr>
        </thead>
        <tbody className="text-0.875 align-middle">
          {positions.map((position) => (
            <Position
              key={position.id.toString()}
              pool={pool}
              baseToken={baseToken}
              quoteToken={quoteToken}
              {...position}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Positions;
