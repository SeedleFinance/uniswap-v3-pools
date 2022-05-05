import React, { useMemo, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useNavigate } from 'react-router-dom';
import { BigNumber } from '@ethersproject/bignumber';
import { isAddress } from '@ethersproject/address';
import { CurrencyAmount, Price, Token } from '@uniswap/sdk-core';
import { Pool, Position as UniPosition, NonfungiblePositionManager } from '@uniswap/v3-sdk';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

import { useTransactionTotals, useReturnValue, useAPR, useFeeAPY } from '../../hooks/calculations';

import { getPositionStatus, PositionStatus } from '../../utils/positionStatus';

import { useCurrencyConversions } from '../../CurrencyConversionsProvider';
import Transaction from './Transaction';
import TransferModal from './TransferModal';
import TokenLabel from '../../ui/TokenLabel';
import Alert, { AlertLevel } from '../../ui/Alert';
import Menu from '../../ui/Menu';
import RangeVisual from './RangeVisual';
import Icon from '../../ui/Icon';
import TransactionModal from '../../ui/TransactionModal';

import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from '../../constants';

export interface PositionProps {
  id: BigNumber;
  pool: Pool;
  baseToken: Token;
  quoteToken: Token;
  entity: UniPosition;
  positionLiquidity?: CurrencyAmount<Token>;
  uncollectedFees: CurrencyAmount<Token>[];
  positionUncollectedFees: CurrencyAmount<Token>;
  priceLower: Price<Token, Token>;
  priceUpper: Price<Token, Token>;
  transactions: any[];
}

function Position({
  id,
  pool,
  baseToken,
  quoteToken,
  entity,
  positionLiquidity,
  uncollectedFees,
  positionUncollectedFees,
  priceLower,
  priceUpper,
  transactions,
}: PositionProps) {
  const { chainId, account, library } = useWeb3React('injected');
  const { convertToGlobalFormatted, formatCurrencyWithSymbol } = useCurrencyConversions();

  const navigate = useNavigate();

  const [showTransactions, setShowTransactions] = useState<boolean>(false);
  const [expandedUncollectedFees, setExpandedUncollectedFees] = useState<boolean>(false);
  const [showActions, setShowActions] = useState<boolean>(false);
  const [showTransfer, setShowTransfer] = useState<boolean>(false);

  const [transactionPending, setTransactionPending] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const [alert, setAlert] = useState<{ message: string; level: AlertLevel } | null>(null);

  const { percent0, percent1 } = useMemo(() => {
    if (!baseToken || !pool || !entity || !positionLiquidity || positionLiquidity.equalTo(0)) {
      return { percent0: '0', percent1: '0' };
    }
    const [value0, value1] = pool.token0.equals(baseToken)
      ? [entity.amount0, pool.priceOf(pool.token1).quote(entity.amount1)]
      : [pool.priceOf(pool.token0).quote(entity.amount0), entity.amount1];
    const calcPercent = (val: CurrencyAmount<Token>) =>
      (
        (parseFloat(val.toSignificant(15)) / parseFloat(positionLiquidity.toSignificant(15))) *
        100
      ).toFixed(2);

    return { percent0: calcPercent(value0), percent1: calcPercent(value1) };
  }, [positionLiquidity, entity, pool, baseToken]);

  const totalCurrentValue = useMemo(() => {
    if (!positionLiquidity || positionLiquidity.equalTo(0)) {
      return CurrencyAmount.fromRawAmount(baseToken, 0);
    }

    return positionLiquidity.add(positionUncollectedFees);
  }, [baseToken, positionLiquidity, positionUncollectedFees]);

  const formattedRange = useMemo(() => {
    const prices = priceLower.lessThan(priceUpper)
      ? [priceLower, priceUpper]
      : [priceUpper, priceLower];
    const decimals = Math.min(baseToken.decimals, 8);
    return prices.map((price) => price.toFixed(decimals)).join(' - ');
  }, [priceUpper, priceLower, baseToken]);

  // const formattedAge = useMemo(() => {
  //   const startDate = new Date(transactions[0].timestamp * 1000);
  //   const endDate = BigNumber.from(entity.liquidity.toString()).isZero()
  //     ? new Date(transactions[transactions.length - 1].timestamp * 1000)
  //     : new Date();

  //   return formatDistanceStrict(endDate, startDate);
  // }, [entity.liquidity, transactions]);

  const positionStatus = useMemo((): PositionStatus => {
    if (!pool) {
      return PositionStatus.Inactive;
    }

    return getPositionStatus(pool.tickCurrent, entity);
  }, [pool, entity]);

  const { totalMintValue, totalBurnValue, totalCollectValue, totalTransactionCost } =
    useTransactionTotals(transactions, baseToken, pool);

  const { returnValue, returnPercent } = useReturnValue(
    baseToken,
    totalMintValue,
    totalBurnValue,
    totalCollectValue,
    totalTransactionCost,
    totalCurrentValue,
  );

  const apr = useAPR(transactions, returnPercent, BigNumber.from(entity.liquidity.toString()));

  const feeAPY = useFeeAPY(pool, baseToken, uncollectedFees, transactions);

  const statusLabel = useMemo(() => {
    const labels = {
      [PositionStatus.Inactive]: 'Closed',
      [PositionStatus.InRange]: 'In Range',
      [PositionStatus.OutRange]: 'Out of Range',
    };
    return labels[positionStatus];
  }, [positionStatus]);

  const getStatusColor = (status: PositionStatus) => {
    const colors = {
      [PositionStatus.Inactive]: 'text-gray-500',
      [PositionStatus.InRange]: 'text-green-500',
      [PositionStatus.OutRange]: 'text-yellow-500',
    };
    return colors[positionStatus];
  };

  const isPerp = baseToken.symbol === 'vUSD';

  const handlePerp = () => {
    setShowActions(false);
    const url = 'https://app.perp.com';
    window.open(url);
  };

  const handleRemove = () => {
    setShowActions(false);
    const url = `https://app.uniswap.org/#/pool/${id}`;
    window.open(url);
  };

  const handleTransactions = () => {
    setShowActions(false);
    setShowTransactions(!showTransactions);
  };

  const handleAddLiquidity = () => {
    navigate(`/add/${quoteToken.symbol}/${baseToken.symbol}/${pool.fee}?position=${id}`);
  };

  const handleTransfer = () => {
    setShowActions(false);
    setShowTransfer(!showTransfer);
  };

  const onTransferCancel = () => {
    setShowTransfer(false);
  };

  const onTransferComplete = async (address: string) => {
    setShowTransfer(false);
    setTransactionPending(true);

    try {
      let recipient = address;
      // check if the address is a hex address
      if (!isAddress(address)) {
        recipient = await library.resolveName(address);
      }

      const { calldata, value } = NonfungiblePositionManager.safeTransferFromParameters({
        sender: account as string,
        recipient,
        tokenId: id.toString(),
      });
      const tx = {
        to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId as number],
        data: calldata,
        value,
      };

      const estimatedGas = await library.getSigner().estimateGas(tx);
      const res = await library.getSigner().sendTransaction({
        ...tx,
        gasLimit: estimatedGas.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000)),
      });

      if (res) {
        setTransactionHash(res.hash);
        await res.wait();
        setAlert({
          message: `Successfully transferred the position to ${recipient}.`,
          level: AlertLevel.Success,
        });
      }
    } catch (e: any) {
      handleTxError(e);
    }
    setTransactionPending(false);
  };

  const handleTxError = (e: any) => {
    console.error(e);
    if (e.error) {
      setAlert({
        message: `Transaction failed. (reason: ${e.error.message} code: ${e.error.code})`,
        level: AlertLevel.Error,
      });
    } else if (e.data) {
      setAlert({
        message: `Transaction failed. (reason: ${e.data.message} code: ${e.data.code})`,
        level: AlertLevel.Error,
      });
    } else if (e.message) {
      setAlert({
        message: `Transaction failed. (reason: ${e.message} code: ${e.code})`,
        level: AlertLevel.Error,
      });
    } else {
      setAlert({
        message: e.toString(),
        level: AlertLevel.Error,
      });
    }
  };

  const resetAlert = () => {
    setAlert(null);
  };

  if (!pool || !entity) {
    return null;
  }

  return (
    <>
      <tr className={positionStatus === PositionStatus.Inactive ? 'text-gray-500' : ''}>
        <td className="flex flex-col justify-between border-t border-slate-200 dark:border-slate-700 py-4">
          <div className="text-lg font-bold">{formattedRange}</div>
          <div className={`text-md ${getStatusColor(positionStatus)}`}>{statusLabel} </div>
          <RangeVisual
            tickCurrent={pool.tickCurrent}
            tickLower={entity.tickLower}
            tickUpper={entity.tickUpper}
            tickSpacing={pool.tickSpacing}
            flip={pool.token0.equals(baseToken)}
          />
        </td>
        <td className="border-t border-slate-200 dark:border-slate-700 py-4">
          <div>
            <TokenLabel symbol={pool.token0.symbol} />: {entity.amount0.toSignificant(4)}({percent0}
            %)
          </div>
          <div>
            <TokenLabel symbol={pool.token1.symbol} />: {entity.amount1.toSignificant(4)}({percent1}
            %)
          </div>
        </td>
        <td className="border-t border-slate-200 dark:border-slate-700 py-4">
          <div>
            {positionLiquidity
              ? convertToGlobalFormatted(positionLiquidity)
              : formatCurrencyWithSymbol(0, 1)}
          </div>
        </td>
        <td className="border-t  border-slate-200 dark:border-slate-700 py-4">
          <div className="flex flex-col items-start justify-center">
            <button
              style={{ borderBottom: '1px dotted' }}
              onClick={() => setExpandedUncollectedFees(!expandedUncollectedFees)}
            >
              {convertToGlobalFormatted(positionUncollectedFees)}
            </button>
            {expandedUncollectedFees ? (
              <div className="flex flex-col text-sm">
                <div>
                  {uncollectedFees[0]?.toFixed(6)} <TokenLabel symbol={pool.token0.symbol} />
                </div>
                <div>
                  {uncollectedFees[1]?.toFixed(6)} <TokenLabel symbol={pool.token1.symbol} />
                </div>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </td>
        <td className="border-t  border-slate-200 dark:border-slate-700 py-4">
          <div className={feeAPY < 0 ? 'text-red-500' : 'text-green-500'}>{feeAPY.toFixed(2)}%</div>
        </td>

        <td className="border-t  border-slate-200 dark:border-slate-700 py-4">
          <div className={returnValue.lessThan(0) ? 'text-red-500' : 'text-green-500'}>
            {convertToGlobalFormatted(returnValue)}
          </div>
        </td>
        <td className="border-t  border-slate-200 dark:border-slate-700 py-4">
          <div className={apr < 0 ? 'text-red-500' : 'text-green-500'}>{apr.toFixed(2)}%</div>
        </td>

        <td className="border-t  border-slate-200 dark:border-slate-700 py-4">
          <div className="flex my-2 justify-end relative">
            <button
              className="text-slate-500 dark:text-slate-200 mr-2"
              onClick={() => setShowActions(!showActions)}
            >
              <Icon size="lg" icon={faEllipsis} />
            </button>
            {showActions && (
              <Menu onClose={() => setShowActions(false)} className="w-32 top-8">
                <button className="text-left my-1" onClick={handleTransactions}>
                  Transactions
                </button>
                {isPerp ? (
                  <button className="text-left my-1" onClick={handlePerp}>
                    Manage
                  </button>
                ) : (
                  <>
                    <button className="text-left my-1" onClick={handleAddLiquidity}>
                      Add Liquidity
                    </button>
                    {/*
                    <button className="text-left my-1" onClick={}>
                      Collect fees
                    </button>
                    */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-1 mt-1">
                      {/*
                      <button className="text-left my-1" onClick={}>
                        Reposition
                      </button>
                      */}
                      <button className="text-left my-1" onClick={handleTransfer}>
                        Transfer
                      </button>
                      <button className="text-left text-red-500 my-1" onClick={handleRemove}>
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </Menu>
            )}
          </div>
        </td>
      </tr>

      {showTransactions && (
        <tr>
          <td colSpan={4}>
            <table className="table-auto border-separate w-full my-2">
              <thead>
                <tr className="text-left">
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Distribution</th>
                  <th>Liquidity</th>
                  <th>Gas cost</th>
                </tr>
              </thead>
              {transactions.map((tx: any) => (
                <Transaction key={tx.id} pool={pool} baseToken={baseToken} {...tx} />
              ))}
            </table>
          </td>
        </tr>
      )}

      {showTransfer && (
        <TransferModal
          tokenId={id}
          baseToken={baseToken}
          quoteToken={quoteToken}
          onCancel={onTransferCancel}
          onComplete={onTransferComplete}
        />
      )}

      {transactionPending && (
        <TransactionModal chainId={chainId} transactionHash={transactionHash} />
      )}

      {alert && (
        <Alert level={alert.level} onHide={resetAlert}>
          {alert.message}
        </Alert>
      )}
    </>
  );
}

export default Position;
