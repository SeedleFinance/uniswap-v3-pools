import { Token, CurrencyAmount } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';
import JSBI from 'jsbi';

import { CustomPosition } from '../../types/seedle';

import PoolButton from '../../ui/PoolButton';
import PositionStatuses from './PositionStatuses';
import TokenLabel from '../../ui/TokenLabel';

import { useCurrencyConversions } from '../../CurrencyConversionsProvider';

interface Props {
  onClick: () => void;
  entity: Pool;
  quoteToken: Token;
  baseToken: Token;
  poolLiquidity: CurrencyAmount<Token>;
  poolUncollectedFees: CurrencyAmount<Token>;
  positions: CustomPosition[];
  currentPrice: number;
}

function Row({
  onClick,
  entity,
  quoteToken,
  baseToken,
  poolLiquidity,
  poolUncollectedFees,
  positions,
  currentPrice,
}: Props) {
  const { convertToGlobalFormatted } = useCurrencyConversions();

  return (
    <tr onClick={onClick} className="hover:bg-surface-5 cursor-pointer">
      <td className="px-2 py-4 md:px-6 md:py-8 md:whitespace-nowrap">
        <PoolButton
          baseToken={baseToken}
          quoteToken={quoteToken}
          fee={entity.fee / 10000}
          showNetwork={true}
          size="xs"
          onClick={() => {}}
        />
      </td>
      <td>
        <span className="px-1">{currentPrice}</span>
        <TokenLabel name={baseToken.name} symbol={baseToken.symbol} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-lg rounded-md text-high ml-2 font-medium text-right">
          {convertToGlobalFormatted(poolLiquidity)}
        </div>
      </td>
      <td>{convertToGlobalFormatted(poolUncollectedFees)}</td>
      <td></td>
      <td>
        <div className="flex flex-col-reverse items-start md:flex-row md:justify-start">
          <PositionStatuses
            tickCurrent={entity.tickCurrent}
            positions={positions
              .map(({ entity }) => entity)
              .filter(({ liquidity }) => JSBI.notEqual(liquidity, JSBI.BigInt(0)))}
            allPositionsCounter={positions.length}
          />
        </div>
      </td>
    </tr>
  );
}
export default Row;
