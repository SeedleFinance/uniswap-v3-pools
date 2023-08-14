import { useMemo, useState } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useFloating, autoUpdate } from '@floating-ui/react-dom';
import { FloatingPortal } from '@floating-ui/react-dom-interactions';
import { BigNumber } from '@ethersproject/bignumber';
import { isAddress } from '@ethersproject/address';
import { CurrencyAmount, Price, Token, Fraction, Percent, NativeCurrency } from '@uniswap/sdk-core';
import { Pool, Position as UniPosition, NonfungiblePositionManager, TickMath, tickToPrice, CollectOptions } from '@uniswap/v3-sdk';
import { useChainId } from '../../hooks/useChainId';
import { useTransactionTotals, useReturnValue, useAPR, useFeeAPY } from '../../hooks/calculations';
import { getPositionStatus, PositionStatus } from '../../utils/positionStatus';
import { useCurrencyConversions } from '../../providers/CurrencyConversionProvider';
import Transaction from './Transaction';
import TransferModal from './TransferModal';
import TokenLabel from '../../components/TokenLabel';
import Alert, { AlertLevel } from '../../components/Alert/Alert';
import Menu from '../../components/Menu/Menu';
import RangeVisual from './RangeVisual';
import TransactionModal from '../../components/TransactionModal';
import {
  LABELS, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES, SWAP_ROUTER_ADDRESSES,
  DEFAULT_SLIPPAGE,
  SWAP_SLIPPAGE,
  ZERO_PERCENT,
} from '../../common/constants';
import Button from '../../components/Button';
import Tooltip from '../../components/Tooltip';
import Warning from '../../components/icons/Warning';
import ElipsisVertical from '../../components/EllipsisVertical';
import { Contract, ethers } from 'ethers';
import {
  findMatchingPosition, findPositionById, positionFromAmounts,
  calculateNewAmounts,
  positionDistance,
  tokenAmountNeedApproval,
  toCurrencyAmount,
} from '../../components/AddLiquidity/utils';
import { AlphaRouter, SwapToRatioStatus, SwapToRatioRoute } from '@uniswap/smart-order-router';
import { formatEther, parseEther, parseUnits } from '@ethersproject/units';
import { getContract } from '../../hooks/useContract';
import { useAllPositions } from '../../hooks/usePosition';
import { AddressZero } from '@ethersproject/constants';
import MaticNativeCurrency from '../../utils/matic';
import { getNativeToken, isNativeToken } from '../../utils/tokens';


type Instructions = {
  whatToDo: number;
  targetToken: string;
  amountRemoveMin0: number;
  amountRemoveMin1: number;
  amountIn0: number;
  amountOut0Min: number;
  amountIn1: number;
  amountOut1Min: number;
  feeAmount0: string;
  feeAmount1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  amountAddMin0: number;
  amountAddMin1: number;
  deadline: number;
  recipient: string;
  recipientNFT: string;
  unwrap: boolean;
  returnData: string;
  swapAndMintReturnData: string;
};

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
  const chainId = useChainId();
  const { address: account } = useAccount();
  const library = useProvider();
  const { data: signer } = useSigner();

  const { convertToGlobalFormatted, formatCurrencyWithSymbol } = useCurrencyConversions();

  const router = useRouter();

  const allPositions = useAllPositions(account);

  const [showTransactions, setShowTransactions] = useState<boolean>(false);
  const [expandedUncollectedFees, setExpandedUncollectedFees] = useState<boolean>(false);
  const [showActions, setShowActions] = useState<boolean>(false);
  const [showTransfer, setShowTransfer] = useState<boolean>(false);

  const [transactionPending, setTransactionPending] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const [alert, setAlert] = useState<{
    message: string;
    level: AlertLevel;
  } | null>(null);

  const { reference: triggerRef, floating } = useFloating({
    whileElementsMounted: autoUpdate,
    placement: 'top',
    strategy: 'absolute',
  });

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
      [PositionStatus.Inactive]: 'text-medium',
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
    router.push(
      `/add?quoteToken=${quoteToken.symbol}&baseToken=${baseToken.symbol}&fee=${pool.fee}&position=${id}`,
    );
  };

  const onAddLiquidityAfterCollect = async (_amount0: string, _amount1: string) => {
    setTransactionPending(true);
    console.log('onAddLiquidityAfterCollect', _amount0, _amount1)
    try {
      const newPosition = positionFromAmounts(
        {
          pool: pool,
          tickLower: entity.tickLower,
          tickUpper: entity.tickUpper,
          val0: Number(_amount0),
          val1: Number(_amount1),
        },
        false,
      );

      const deadline = +new Date() + 10 * 60 * 1000; // TODO: use current blockchain timestamp

      /* const slippageTolerance =
        baseTokenDisabled || quoteTokenDisabled ? ZERO_PERCENT : DEFAULT_SLIPPAGE;
        */

      const depositWrapped = false;
      const useNative =
        isNativeToken(pool.token0) || isNativeToken(pool.token1)
          ? !depositWrapped
            ? getNativeToken(chainId)
            : undefined
          : undefined;

      const slippageTolerance = DEFAULT_SLIPPAGE

      const { calldata, value } = NonfungiblePositionManager.addCallParameters(newPosition, {
        tokenId: Number(id),
        deadline,
        slippageTolerance,
        useNative
      })

      const tx = {
        to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
        data: calldata,
        value,
      };

      const estimatedGas = await signer!.estimateGas(tx);
      const res = await signer!.sendTransaction({
        ...tx,
        gasLimit: estimatedGas.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000)),
      });
      if (res) {
        setTransactionHash(res.hash);
        await res.wait();
        setAlert({
          message: 'Liquidity added to the pool.',
          level: AlertLevel.Success,
        });
      }
    } catch (e: any) {
      handleTxError(e);
    }
    setTransactionPending(false);
    setTransactionHash(null);
  };

  const handleCompound = async () => {
    setTransactionPending(true);
    setAlert({
      message: 'Collecting...',
      level: AlertLevel.Success,
    });

    const amount0 = uncollectedFees[0]?.toExact();
    const amount1 = uncollectedFees[1]?.toExact();

    try {
      const collectOptions: CollectOptions = {
        tokenId: Number(id),
        expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(
          pool.token0,
          Number(parseEther(uncollectedFees[0].toExact()))
        ),
        expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(
          pool.token1,
          Number(parseEther(uncollectedFees[1].toExact()))
        ),
        recipient: await signer?.getAddress() as string,
      }

      const { calldata, value } =
        NonfungiblePositionManager.collectCallParameters(collectOptions)

      const tx = {
        to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId as number],
        data: calldata,
        value: 0,
      };

      setTransactionPending(true);

      const estimatedGas = await signer!.estimateGas(tx);
      const res = await signer!.sendTransaction({
        ...tx,
        gasLimit: estimatedGas.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000)),
      });

      if (res) {
        setTransactionHash(res.hash);
        await res.wait();
        setAlert({
          message: `Successfully collected all fees for token ${id}.`,
          level: AlertLevel.Success,
        });
      }
    } catch (e: any) {
      handleTxError(e);
    }
    setTransactionPending(false);

    setAlert({
      message: 'Adding liquidity...',
      level: AlertLevel.Success,
    });
    setTransactionPending(true);

    if (!amount0 || !amount1) {
      setAlert({
        message: 'No fees to collect.',
        level: AlertLevel.Error,
      });
      return;
    }

    onAddLiquidityAfterCollect(amount0, amount1);

    setTransactionPending(false);
    setTransactionHash(null);
  };

  async function handleCollectFees() {
    try {
      const collectOptions: CollectOptions = {
        tokenId: Number(id),
        expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(
          pool.token0,
          Number(parseEther(uncollectedFees[0].toExact()))
        ),
        expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(
          pool.token1,
          Number(parseEther(uncollectedFees[1].toExact()))
        ),
        recipient: await signer?.getAddress() as string,
      }

      const { calldata, value } =
        NonfungiblePositionManager.collectCallParameters(collectOptions)

      const tx = {
        to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId as number],
        data: calldata,
        value: 0,
      };

      setTransactionPending(true);

      const estimatedGas = await signer!.estimateGas(tx);
      const res = await signer!.sendTransaction({
        ...tx,
        gasLimit: estimatedGas.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000)),
      });

      if (res) {
        setTransactionHash(res.hash);
        await res.wait();
        setAlert({
          message: `Successfully collected all fees for token ${id}.`,
          level: AlertLevel.Success,
        });
      }
    } catch (e: any) {
      handleTxError(e);
    }
    setTransactionPending(false);
  };

  const tx = {
    to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId as number],
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
      if (!isAddress(address)) {
        // if the address is not a hex address, treat it as an ENS name
        recipient = (await library.resolveName(address)) || '';
      }

      if (recipient === '') {
        return;
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

      const estimatedGas = await signer!.estimateGas(tx);
      const res = await signer!.sendTransaction({
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

  /*  const handleClosePosition = async () => {
     setTransactionPending(true);
 
     try {
       const deadline = +new Date() + 10 * 60 * 1000; // TODO: use current blockchain timestamp
       const depositWrapped = false;
       const useNative =
         isNativeToken(pool.token0) || isNativeToken(pool.token1)
           ? !depositWrapped
             ? getNativeToken(chainId)
             : undefined
           : undefined;
 
       const collectOptions: Omit<CollectOptions, 'tokenId'> = {
         expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(
           pool.token0,
           0
         ),
         expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(
           pool.token1,
           0
         ),
         recipient: String(signer?.getAddress()),
       }
 
       const { calldata, value } = NonfungiblePositionManager.removeCallParameters((id as any),
         {
           tokenId: id.toString(),
           liquidityPercentage: new Percent(1),
           deadline: deadline,
           slippageTolerance: new Percent(50, 10_000),
           burnToken: true,
           collectOptions
         },
       );
 
 
       const tx = {
         to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
         data: calldata,
         value,
       };
 
       const estimatedGas = await signer!.estimateGas(tx);
       const res = await signer!.sendTransaction({
         ...tx,
         gasLimit: estimatedGas.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000)),
       });
       if (res) {
         setTransactionHash(res.hash);
         await res.wait();
         setAlert({
           message: 'Liquidity removed from the pool.',
           level: AlertLevel.Success,
         });
       }
     } catch (e: any) {
       handleTxError(e);
     }
     setTransactionPending(false);
     setTransactionHash(null);
   }; */

  const resetAlert = () => {
    setAlert(null);
  };

  if (!pool || !entity) {
    return null;
  }

  const positionTextColor = positionStatus === PositionStatus.Inactive ? 'text-low' : '';

  const portalId = id.toString();

  return (
    <>
      <tr className={classNames(positionTextColor, 'border-b border-element-10 text-0.8125')}>
        <td className="flex flex-col justify-between px-4 py-4">
          <div
            className={`text-0.875  font-medium flex items-center pointer ${getStatusColor(
              positionStatus,
            )}`}
          >
            {statusLabel}
            {positionStatus === 2 && (
              <Tooltip label={LABELS.POSITION.OUT_OF_RANGE} placement="top">
                <div className="pointer">
                  <Warning className="ml-2 bg-yellow-500" />
                </div>
              </Tooltip>
            )}
          </div>

          <RangeVisual
            tickCurrent={pool.tickCurrent}
            tickLower={entity.tickLower}
            tickUpper={entity.tickUpper}
            tickSpacing={pool.tickSpacing}
            flip={pool.token0.equals(baseToken)}
            className="mt-2"
          />
          <div className="text-0.8125 py-2 flex flex-col">{formattedRange}</div>
        </td>
        <td className="px-4 py-4">
          <div>
            <TokenLabel symbol={pool.token0.symbol} />: {entity.amount0.toSignificant(4)}({percent0}
            %)
          </div>
          <div>
            <TokenLabel symbol={pool.token1.symbol} />: {entity.amount1.toSignificant(4)}({percent1}
            %)
          </div>
        </td>
        <td className="px-4 py-4">
          <div>
            {positionLiquidity
              ? convertToGlobalFormatted(positionLiquidity)
              : formatCurrencyWithSymbol(0, 1)}
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="flex flex-col items-start justify-center">
            <button
              style={{ borderBottom: '1px dotted border-element-20' }}
              onClick={() => setExpandedUncollectedFees(!expandedUncollectedFees)}
            >
              {convertToGlobalFormatted(positionUncollectedFees)}
            </button>
            {expandedUncollectedFees ? (
              <div className="flex flex-col">
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
        <td className="px-4 py-4">
          <div className={feeAPY < 0 ? 'text-red-500' : 'text-green-500'}>{feeAPY.toFixed(2)}%</div>
        </td>

        <td className="px-4 py-4">
          <div className={returnValue.lessThan(0) ? 'text-red-500' : 'text-green-500'}>
            {convertToGlobalFormatted(returnValue)}
          </div>
        </td>
        <td className="px-4 py-4">
          <div
            className={
              apr < 0 ? 'text-red-500 hidden md:block ' : 'text-green-500 hidden md:block '
            }
          >
            {apr.toFixed(2)}%
          </div>
        </td>
        <td className="py-4 hidden md:table-cell">
          <div id={`menu-${portalId}`}>
            <Button variant="ghost" onClick={() => setShowActions(!showActions)}>
              <ElipsisVertical />
            </Button>
          </div>
          <div ref={floating}>
            <FloatingPortal id={`menu-${portalId}`}>
              {showActions && (
                <Menu onClose={() => setShowActions(false)} className="w-32 shadow-lg text-0.875">
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
                      <button className="text-left my-1" onClick={handleCollectFees}>
                        Collect Fees
                      </button>
                      <button className="text-left my-1" onClick={handleCompound} disabled={false}>
                        Compound
                      </button>
                      <div className="pt-1 mt-1">
                        <div>
                          <button className="text-left my-1" onClick={handleTransfer}>
                            Transfer
                          </button>
                        </div>
                        <button className="text-left text-red-500 my-1" onClick={handleRemove}>
                          Remove
                        </button>
                      </div>
                    </>
                  )}
                </Menu>
              )}
            </FloatingPortal>
          </div>
        </td>
      </tr>

      {showTransactions && (
        <tr>
          <td colSpan={12}>
            <table className="table-auto w-full border-separate  my-2 px-4 -ml-4 mt-6">
              <thead className="bg-surface-5">
                <tr className="text-left">
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Distribution</th>
                  <th className="px-4 py-2">Liquidity</th>
                  <th className="px-4 py-2">Gas cost</th>
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
