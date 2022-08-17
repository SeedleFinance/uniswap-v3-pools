import { useMemo } from 'react';
import { Token, CurrencyAmount } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';
import JSBI from 'jsbi';

import { CustomPosition } from '../../types/seedle';

import PoolButton from '../../ui/PoolButton';
import PositionStatuses from './PositionStatuses';
import TokenLabel from '../../ui/TokenLabel';

import { useCurrencyConversions } from '../../CurrencyConversionsProvider';
import { useFeeAPY } from '../../hooks/calculations';

interface Props {
  onClick: () => void;
  entity: Pool;
  quoteToken: Token;
  baseToken: Token;
  poolLiquidity: CurrencyAmount<Token>;
  poolUncollectedFees: CurrencyAmount<Token>;
  currencyPoolUncollectedFees: CurrencyAmount<Token>[];
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
  currencyPoolUncollectedFees,
  positions,
  currentPrice,
}: Props) {
  const { convertToGlobalFormatted } = useCurrencyConversions();

  const poolTransactions = useMemo(() => {
    return positions.reduce((txs: any[], { transactions }: any) => {
      txs.push(...transactions);
      return txs;
    }, []);
  }, [positions]);

  const feeAPY = useFeeAPY(entity, baseToken, currencyPoolUncollectedFees, poolTransactions);

  return (
    <tr onClick={onClick} className="hover:bg-surface-5 cursor-pointer">
      <td className="px-2 py-4 md:px-6 md:py-8 md:whitespace-nowrap">
        <PoolButton
          baseToken={baseToken}
          quoteToken={quoteToken}
          fee={entity.fee / 10000}
          showNetwork={true}
          size="md"
          onClick={() => {}}
        />
      </td>
      <td className="px-4 py-6 whitespace-nowrap">
        <div className="text-lg rounded-md text-high ml-2 font-medium text-right">
          <span className="px-1">{currentPrice}</span>
          <TokenLabel name={baseToken.name} symbol={baseToken.symbol} />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-lg rounded-md text-high ml-2 font-medium text-right">
          {convertToGlobalFormatted(poolLiquidity)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-lg rounded-md text-high ml-2 font-medium text-right">
          {convertToGlobalFormatted(poolUncollectedFees)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-lg rounded-md text-high ml-2 font-medium text-right">
          <div className={feeAPY < 0 ? 'text-red-500' : 'text-green-500'}>{feeAPY.toFixed(2)}%</div>
        </div>
      </td>
      <td>
        <div className="flex flex-col-reverse items-end md:flex-row md:justify-end">
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
