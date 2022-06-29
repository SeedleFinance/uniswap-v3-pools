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
    <div className="w-full flex flex-col my-2 border border-slate-200 dark:border-slate-700 rounded py-4 px-6">
      <table className="table-auto w-full text-high">
        <thead>
          <tr className="text-left">
            <th className="pb-4">Range</th>
            <th className="pb-4">Distribution</th>
            <th className="pb-4">Liquidity</th>
            <th className="pb-4">Uncl. fees</th>
            <th className="pb-4">
              <span
                className="underline underline-offset-1 decoration-dotted cursor-help"
                title="annualized fees earned over liquidity"
              >
                Fee APY
              </span>
            </th>
            <th className="pb-4">
              <span
                className="underline underline-offset-1 decoration-dotted cursor-help"
                title="liquidity gain + fees - gas cost"
              >
                Net Return
              </span>
            </th>
            <th className="pb-4">
              <span
                style={{ borderBottom: '1px dotted', cursor: 'help' }}
                title="Net Annual Percentage Yield"
              >
                Net APY
              </span>
            </th>
            <th className="pb-4"></th>
          </tr>
        </thead>
        <tbody>
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
