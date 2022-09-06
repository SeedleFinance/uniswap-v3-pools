import { CurrencyAmount, Token } from '@uniswap/sdk-core';
import { Position } from '@uniswap/v3-sdk';
import { usePools } from '../providers/CombinedPoolsProvider';

export function useCSV() {
  const { pools } = usePools();

  const prepareCSV = () => {
    const cols = [
      '"Id"',
      'ChainID',
      '"Token 0"',
      '"Token 1"',
      '"Fee tier"',
      '"Tick Lower"',
      '"Tick Upper"',
      '"Liquidity 0"',
      '"Liquidity 1"',
      '"Fees 0"',
      '"Fees 1"',
    ].join(',');
    const positionData = pools
      .map(({ positions }) =>
        positions.map(
          (pos: { id: number; entity: Position; uncollectedFees: CurrencyAmount<Token>[] }) => ({
            id: pos.id,
            chainId: pos.entity.pool.token0.chainId,
            token0: pos.entity.pool.token0.symbol,
            token1: pos.entity.pool.token1.symbol,
            feeTier: pos.entity.pool.fee,
            tickLower: pos.entity.tickLower,
            tickUpper: pos.entity.tickUpper,
            liquidity0: pos.entity.amount0.toSignificant(16),
            liquidity1: pos.entity.amount1.toSignificant(16),
            fees0: pos.uncollectedFees[0].toSignificant(16),
            fees1: pos.uncollectedFees[1].toSignificant(16),
          }),
        ),
      )
      .flat();

    const rows = positionData.map((pos) =>
      Object.values(pos)
        .map((c) => `"${c}"`)
        .join(','),
    );
    return [cols, ...rows].join('\n');
  };

  const generateFilename = (ext: string) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${
      now.getMonth() + 1
    }${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    return `uniswap-v3-positions-${timestamp}.${ext}`;
  };

  const downloadFile = (contents: string, mime: string, filename: string) => {
    const el = document.createElement('a');
    el.setAttribute('href', `data:${mime},` + encodeURIComponent(contents));
    el.setAttribute('download', filename);
    el.click();
  };

  const handleDownloadCSV = () => {
    downloadFile(prepareCSV(), 'text/csv;charset=utf-16', generateFilename('csv'));
  };

  return handleDownloadCSV;
}

export default useCSV;
