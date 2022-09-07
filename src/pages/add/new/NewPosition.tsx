import React, { useState, useEffect, useMemo } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
// import { useSearchParams } from 'react-router-dom';
import { TickMath, tickToPrice, NonfungiblePositionManager, Position } from '@uniswap/v3-sdk';
import { Token, CurrencyAmount, Fraction } from '@uniswap/sdk-core';
import { BigNumber } from '@ethersproject/bignumber';
import { AlphaRouter, SwapToRatioStatus, SwapToRatioRoute } from '@uniswap/smart-order-router';

import { useChainId } from '../../../hooks/useChainId';
import { useTokenFunctions } from '../../../hooks/useTokenFunctions';
import { usePool } from '../../../hooks/usePool';
import { useCurrencyConversions } from '../../../providers/CurrencyConversionProvider';
import PoolButton from '../../../components/PoolButton';
import TokenLabel from '../../../components/TokenLabel';
import Alert, { AlertLevel } from '../../../components/Alert/Alert';
import Button from '../../../components/Button';
import Toggle from '../../../components/Toggle';
import ChartButton from './ChartButton';
import FeeTierData from './FeeTierData';
import RangeData from './RangeData';

import {
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  SWAP_ROUTER_ADDRESSES,
  DEFAULT_SLIPPAGE,
  SWAP_SLIPPAGE,
  ZERO_PERCENT,
} from '../../../common/constants';

import { formatInput } from '../../../utils/numbers';
import { getNativeToken, isNativeToken } from '../../../utils/tokens';

import RangeInput from './RangeInput';
import DepositInput from './DepositInput';
import FeeButton from './FeeButton';
import SwapAndAddModal from './SwapAndAddModal';
import TransactionModal from '../../../components/TransactionModal';
import {
  positionFromAmounts,
  calculateNewAmounts,
  positionDistance,
  tokenAmountNeedApproval,
  toCurrencyAmount,
  findMatchingPosition,
  findPositionById,
} from './utils';
import { useRouter } from 'next/router';

interface Props {
  baseToken: Token;
  quoteToken: Token;
  initFee: number;
  positions: any[] | null;
  onCancel: () => void;
}

function NewPosition({ baseToken, quoteToken, initFee, positions, onCancel }: Props) {
  const chainId = useChainId();
  const { address: account } = useAccount();
  const library = useProvider();
  const { data: signer } = useSigner();
  const router = useRouter();

  const positionId = router.query.id as string;

  const [depositWrapped, setDepositWrapped] = useState<boolean>(false);

  const { getBalances, getAllowances, approveToken } = useTokenFunctions(
    [baseToken, quoteToken],
    account,
    !depositWrapped,
  );
  const { convertToGlobalFormatted } = useCurrencyConversions();

  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [fee, setFee] = useState<number>(initFee);

  const { pool } = usePool(baseToken, quoteToken, fee);

  const [tickLower, setTickLower] = useState<number>(TickMath.MIN_TICK);
  const [tickUpper, setTickUpper] = useState<number>(TickMath.MIN_TICK);

  const [baseBalance, setBaseBalance] = useState<string>('0');
  const [quoteBalance, setQuoteBalance] = useState<string>('0');

  const [baseTokenDisabled, setBaseTokenDisabled] = useState<boolean>(false);
  const [quoteTokenDisabled, setQuoteTokenDisabled] = useState<boolean>(false);

  const [baseTokenAllowance, setBaseTokenAllowance] = useState<number>(0);
  const [quoteTokenAllowance, setQuoteTokenAllowance] = useState<number>(0);

  const [transactionPending, setTransactionPending] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const [swapAndAdd, setSwapAndAdd] = useState<boolean>(false);
  const [swapAndAddPending, setSwapAndAddPending] = useState<boolean>(false);
  const [swapAndAddRoute, setSwapAndAddRoute] = useState<SwapToRatioRoute | null>(null);

  const [showFeeTierData, setShowFeeTierData] = useState<boolean>(false);
  const [showRangeData, setShowRangeData] = useState<boolean>(false);

  const [focusedRangeInput, setFocusedRangeInput] = useState<HTMLInputElement | null>(null);
  const [alert, setAlert] = useState<{ message: string; level: AlertLevel } | null>(null);

  useEffect(() => {
    const _run = async () => {
      const [bal0, bal1] = await getBalances();
      setBaseBalance(formatInput(parseFloat(bal0)));
      setQuoteBalance(formatInput(parseFloat(bal1)));
    };
    _run();
  }, [getBalances]);

  useEffect(() => {
    if (!getAllowances) {
      return;
    }

    const _run = async () => {
      const spender = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId];
      const [val0, val1] = await getAllowances(spender);
      setBaseTokenAllowance(val0);
      setQuoteTokenAllowance(val1);
    };

    _run();
  }, [getAllowances, chainId]);

  const rangeReverse = useMemo(() => {
    if (!quoteToken || !baseToken) {
      return false;
    }

    return baseToken.sortsBefore(quoteToken);
  }, [quoteToken, baseToken]);

  const suggestedTicks = useMemo(() => {
    let tickLower = TickMath.MIN_TICK;
    let tickUpper = TickMath.MIN_TICK;
    if (!pool) {
      return [tickLower, tickUpper];
    }

    const { tickCurrent, tickSpacing } = pool;
    if (!positions || !positions.length) {
      tickLower = Math.round((tickCurrent - 10 * tickSpacing) / tickSpacing) * tickSpacing;
      tickUpper = Math.round((tickCurrent + 10 * tickSpacing) / tickSpacing) * tickSpacing;
    } else {
      const position = findPositionById(positions, positionId);
      if (position) {
        tickLower = position.entity.tickLower;
        tickUpper = position.entity.tickUpper;
      } else {
        let sortedPositions = positions.sort((posA, posB) => {
          const disA = positionDistance(tickCurrent, posA);
          const disB = positionDistance(tickCurrent, posB);
          return disA - disB;
        });

        tickLower = sortedPositions[0].entity.tickLower;
        tickUpper = sortedPositions[0].entity.tickUpper;
      }
    }

    if (rangeReverse) {
      return [tickUpper, tickLower];
    }
    return [tickLower, tickUpper];
  }, [pool, positions, rangeReverse, positionId]);

  useEffect(() => {
    setTickLower(suggestedTicks[0]);
    setTickUpper(suggestedTicks[1]);
  }, [suggestedTicks]);

  useEffect(() => {
    if (!pool || !baseToken || !quoteToken) {
      return;
    }

    // if swap and add is enabled, we don't disable any token
    if (swapAndAdd) {
      setBaseTokenDisabled(false);
      setQuoteTokenDisabled(false);
      return;
    }

    const { tickCurrent } = pool;

    let [lower, upper] = [tickLower, tickUpper];
    if (rangeReverse) {
      [lower, upper] = [tickUpper, tickLower];
    }

    const token0Disabled = tickCurrent > upper;
    const token1Disabled = tickCurrent < lower;

    setBaseTokenDisabled(pool.token0.equals(baseToken) ? token0Disabled : token1Disabled);
    setQuoteTokenDisabled(pool.token1.equals(quoteToken) ? token1Disabled : token0Disabled);
  }, [pool, tickLower, tickUpper, baseToken, quoteToken, rangeReverse, swapAndAdd]);

  const baseTokenNeedApproval = useMemo(() => {
    if (!baseToken) {
      return false;
    }

    return tokenAmountNeedApproval(
      chainId,
      baseToken,
      baseTokenAllowance,
      baseAmount,
      depositWrapped,
    );
  }, [chainId, baseToken, baseAmount, baseTokenAllowance, depositWrapped]);

  const quoteTokenNeedApproval = useMemo(() => {
    if (!quoteToken) {
      return false;
    }

    return tokenAmountNeedApproval(
      chainId,
      quoteToken,
      quoteTokenAllowance,
      quoteAmount,
      depositWrapped,
    );
  }, [chainId, quoteToken, quoteAmount, quoteTokenAllowance, depositWrapped]);

  const totalPositionValue = useMemo(() => {
    if (!pool) {
      return CurrencyAmount.fromRawAmount(baseToken, 0);
    }

    const quoteRaw = Math.ceil(quoteAmount * Math.pow(10, quoteToken.decimals));
    const baseRaw = Math.ceil(baseAmount * Math.pow(10, baseToken.decimals));
    return pool
      .priceOf(quoteToken)
      .quote(CurrencyAmount.fromRawAmount(quoteToken, quoteRaw))
      .add(CurrencyAmount.fromRawAmount(baseToken, baseRaw));
  }, [pool, quoteToken, baseToken, baseAmount, quoteAmount]);

  const calculateBaseAndQuoteAmounts = (val0: number, val1: number) => {
    if (!pool) {
      return;
    }

    if (swapAndAdd) {
      return;
    }

    if (tickLower === TickMath.MIN_TICK || tickUpper === TickMath.MIN_TICK) {
      return;
    }

    if (val0 === 0 && val1 === 0) {
      return;
    }

    const [newQuoteAmount, newBaseAmount] = calculateNewAmounts(
      {
        pool,
        tickLower,
        tickUpper,
        val0,
        val1,
      },
      rangeReverse,
    );

    setQuoteAmount(newQuoteAmount);
    setBaseAmount(newBaseAmount);
  };

  const tickLowerChange = (value: number) => {
    setTickLower(value);
    calculateBaseAndQuoteAmounts(quoteAmount, baseAmount);
  };

  const tickUpperChange = (value: number) => {
    setTickUpper(value);
    calculateBaseAndQuoteAmounts(quoteAmount, baseAmount);
  };

  const quoteDepositChange = (value: number) => {
    setQuoteAmount(value);
    calculateBaseAndQuoteAmounts(value, 0);
  };

  const baseDepositChange = (value: number) => {
    setBaseAmount(value);
    calculateBaseAndQuoteAmounts(0, value);
  };

  const currentPrice = useMemo(() => {
    if (!pool || !baseToken || !quoteToken) {
      return '0';
    }

    const { tickCurrent } = pool;
    const price = parseFloat(tickToPrice(quoteToken, baseToken, tickCurrent).toSignificant(16));

    return formatInput(price, false, pool.tickSpacing === 1 ? 8 : 4);
  }, [pool, baseToken, quoteToken]);

  if (!pool || !baseToken || !quoteToken) {
    return null;
  }

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

  const onSwapAndAddLiquidity = async () => {
    setSwapAndAddPending(true);

    try {
      if (quoteAmount > 0 && quoteAmount > parseFloat(quoteBalance)) {
        throw new Error(`You don't have enough ${quoteToken.symbol} to complete the transaction`);
      }

      if (baseAmount > 0 && baseAmount > parseFloat(baseBalance)) {
        throw new Error(`You don't have enough ${baseToken.symbol} to complete the transaction`);
      }

      const router = new AlphaRouter({
        chainId,
        provider: library,
      });

      let token0Balance, token1Balance, matchingPosition;
      if (rangeReverse) {
        token0Balance = toCurrencyAmount(baseToken, baseAmount, depositWrapped);
        token1Balance = toCurrencyAmount(quoteToken, quoteAmount, depositWrapped);
        matchingPosition = findMatchingPosition(positions, fee, tickUpper, tickLower);
      } else {
        token0Balance = toCurrencyAmount(quoteToken, quoteAmount, depositWrapped);
        token1Balance = toCurrencyAmount(baseToken, baseAmount, depositWrapped);
        matchingPosition = findMatchingPosition(positions, fee, tickLower, tickUpper);
      }

      const addLiquidityOptions: any = {};
      if (matchingPosition) {
        addLiquidityOptions.tokenId = matchingPosition.id;
      } else {
        addLiquidityOptions.recipient = account;
      }

      const newPosition = new Position({
        pool,
        liquidity: 1,
        tickLower: rangeReverse ? tickUpper : tickLower,
        tickUpper: rangeReverse ? tickLower : tickUpper,
      });
      const config = {
        maxIterations: 6,
        ratioErrorTolerance: new Fraction(1, 1000),
      };

      const opts = {
        swapOptions: {
          recipient: account as string,
          slippageTolerance: SWAP_SLIPPAGE,
          deadline: +new Date() + 10 * 60 * 1000, // TODO: use current blockchain timestamp,
        },
        addLiquidityOptions,
      };

      const routerResult = await router.routeToRatio(
        token0Balance,
        token1Balance,
        newPosition,
        config,
        opts,
      );

      // add a timeout

      if (routerResult.status === SwapToRatioStatus.NO_ROUTE_FOUND) {
        console.error(routerResult.error);
        throw new Error('Failed to find a route to swap');
      } else if (routerResult.status === SwapToRatioStatus.NO_SWAP_NEEDED) {
        setSwapAndAddPending(false);
        setSwapAndAddRoute(null);
        onAddLiquidity();
      } else if (routerResult.status === SwapToRatioStatus.SUCCESS) {
        setSwapAndAddRoute(routerResult.result);
      }
    } catch (e: any) {
      handleTxError(e);
      setSwapAndAddPending(false);
      setTransactionHash(null);
    }
  };

  const onSwapAndAddComplete = async () => {
    setTransactionPending(true);

    try {
      const route = swapAndAddRoute;

      if (!route || !route.methodParameters) {
        throw new Error('Swap and Add: no valid route found');
      }

      // check if the value is > 0
      let value = BigNumber.from(route.methodParameters.value);
      if (value.lt(BigNumber.from(0))) {
        value = BigNumber.from(0);
      }

      const tx = {
        to: SWAP_ROUTER_ADDRESSES[chainId],
        value,
        data: route.methodParameters.calldata,
        gasPrice: BigNumber.from(route.gasPriceWei),
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
    setSwapAndAddPending(false);
    setSwapAndAddRoute(null);
    setTransactionPending(false);
    setTransactionHash(null);
  };

  const onSwapAndAddCancel = () => {
    setSwapAndAddPending(false);
    setSwapAndAddRoute(null);
  };

  const onAddLiquidity = async () => {
    setTransactionPending(true);

    try {
      if (quoteAmount > 0 && quoteAmount > parseFloat(quoteBalance)) {
        throw new Error(`You don't have enough ${quoteToken.symbol} to complete the transaction`);
      }

      if (baseAmount > 0 && baseAmount > parseFloat(baseBalance)) {
        throw new Error(`You don't have enough ${baseToken.symbol} to complete the transaction`);
      }

      // see if the current tick range  and pool match an existing position,
      // if match found, call increaseLiquidity
      // otherwise call mint
      const matchingPosition = findMatchingPosition(positions, fee, tickLower, tickUpper);

      const newPosition = positionFromAmounts(
        {
          pool,
          tickLower,
          tickUpper,
          val0: quoteAmount,
          val1: baseAmount,
        },
        rangeReverse,
      );

      const deadline = +new Date() + 10 * 60 * 1000; // TODO: use current blockchain timestamp
      const slippageTolerance =
        baseTokenDisabled || quoteTokenDisabled ? ZERO_PERCENT : DEFAULT_SLIPPAGE;
      const useNative =
        isNativeToken(pool.token0) || isNativeToken(pool.token1)
          ? !depositWrapped
            ? getNativeToken(chainId)
            : undefined
          : undefined;

      const { calldata, value } = matchingPosition
        ? NonfungiblePositionManager.addCallParameters(newPosition, {
            tokenId: matchingPosition.id,
            deadline,
            slippageTolerance,
            useNative,
          })
        : NonfungiblePositionManager.addCallParameters(newPosition, {
            recipient: account as string,
            deadline,
            slippageTolerance,
            useNative,
          });

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

  const onApprove = async (token: Token, amount: number, spender: string) => {
    setTransactionPending(true);
    try {
      const res = await approveToken(token, spender, amount);
      if (res) {
        setTransactionHash(res.hash);
        await res.wait();
        setAlert({
          message: 'Token approval confirmed.',
          level: AlertLevel.Success,
        });
        setTransactionPending(false);
        setTransactionHash(null);
      }
    } catch (e: any) {
      console.error(e);
      if (e.error) {
        setAlert({
          message: `Transaction failed. (reason: ${e.error.message} code: ${e.error.code})`,
          level: AlertLevel.Error,
        });
      } else if (e.message) {
        setAlert({
          message: `Transaction failed. (reason: ${e.message})`,
          level: AlertLevel.Error,
        });
      } else {
        setAlert({
          message: e.toString(),
          level: AlertLevel.Error,
        });
      }
      setTransactionPending(false);
      setTransactionHash(null);
    }
  };

  const resetAlert = () => {
    setAlert(null);
  };

  const handleCurrentPriceClick = () => {
    if (focusedRangeInput) {
      const curLength = focusedRangeInput.value.length;
      focusedRangeInput.setRangeText(currentPrice, 0, curLength, 'start');
      focusedRangeInput.dispatchEvent(new Event('input', { bubbles: true }));
      focusedRangeInput.focus();
    }
  };

  const handleFeeTierDataClick = () => {
    setShowFeeTierData(!showFeeTierData);
  };

  const handleRangeDataClick = () => {
    setShowRangeData(!showRangeData);
  };

  const toggleDepositWrapped = () => {
    setDepositWrapped(!depositWrapped);
  };

  return (
    <div className="w-full flex text-high">
      <div className="lg:w-1/2">
        <div className="flex flex-col my-2">
          <div className="text-xl">Pair</div>
          <div className="w-80 my-2 p-2 text-lg border rounded border-blue-400 dark:border-slate-700 bg-blue-100 dark:bg-slate-700">
            <PoolButton
              baseToken={baseToken}
              quoteToken={quoteToken}
              onClick={() => {}}
              tabIndex={0}
              size="md"
            />
          </div>
        </div>

        <div className="w-72 flex flex-col my-3">
          <div className="flex items-center justify-between">
            <div className="text-xl">Fee tier</div>
            <div className="mx-2">
              <ChartButton selected={showFeeTierData} onClick={handleFeeTierDataClick} />
            </div>
          </div>
          <div className="my-2 flex justify-between">
            <FeeButton fee={0.01} selected={fee === 100} onClick={() => setFee(100)} tabIndex={1} />
            <FeeButton fee={0.05} selected={fee === 500} onClick={() => setFee(500)} tabIndex={2} />
            <FeeButton
              fee={0.3}
              selected={fee === 3000}
              onClick={() => setFee(3000)}
              tabIndex={3}
            />
            <FeeButton
              fee={1}
              selected={fee === 10000}
              onClick={() => setFee(10000)}
              tabIndex={4}
            />
          </div>
        </div>

        <div className="flex flex-col my-2 w-5/6">
          <div className="flex items-center justify-between">
            <div className="text-xl">Range</div>
            <div className="px-6">
              <ChartButton selected={showRangeData} onClick={handleRangeDataClick} />
            </div>
          </div>

          <div className="py-1 text-center">
            Current price:{' '}
            <button onClick={handleCurrentPriceClick} className="font-bold">
              {currentPrice}&nbsp;
            </button>
            <TokenLabel name={baseToken.name} symbol={baseToken.symbol} />
          </div>
          <div className="w-1/3 my-2 flex justify-between">
            <RangeInput
              label="Min"
              initTick={suggestedTicks[0]}
              baseToken={baseToken}
              quoteToken={quoteToken}
              tickSpacing={pool.tickSpacing}
              tabIndex={4}
              reverse={rangeReverse}
              onChange={tickLowerChange}
              onFocus={(el) => setFocusedRangeInput(el)}
            />
            <RangeInput
              label="Max"
              initTick={suggestedTicks[1]}
              baseToken={baseToken}
              quoteToken={quoteToken}
              tickSpacing={pool.tickSpacing}
              tabIndex={5}
              reverse={rangeReverse}
              onChange={tickUpperChange}
              onFocus={(el) => setFocusedRangeInput(el)}
            />
          </div>
        </div>

        <div className="flex flex-col my-6">
          <div className="lg:w-3/4 flex justify-between">
            <div className="text-xl">Deposit</div>
            <div>
              <Toggle
                label="Swap & Add"
                onChange={() => setSwapAndAdd(!swapAndAdd)}
                checked={swapAndAdd}
              />
            </div>
          </div>
          <div className="lg:w-3/4 my-2">
            <DepositInput
              token={quoteToken}
              value={quoteAmount}
              balance={quoteBalance}
              tabIndex={6}
              disabled={quoteTokenDisabled}
              wrapped={depositWrapped}
              onChange={quoteDepositChange}
              onWrapToggle={toggleDepositWrapped}
            />
            <DepositInput
              token={baseToken}
              value={baseAmount}
              balance={baseBalance}
              tabIndex={7}
              disabled={baseTokenDisabled}
              wrapped={depositWrapped}
              onChange={baseDepositChange}
              onWrapToggle={toggleDepositWrapped}
            />
          </div>
          <div className="w-64 mb-2 text-sm">
            Total position value:{' '}
            <span className="font-bold">{convertToGlobalFormatted(totalPositionValue)}</span>
          </div>
        </div>

        <div className="w-64 my-2 flex">
          {swapAndAdd ? (
            <Button
              onClick={onSwapAndAddLiquidity}
              disabled={transactionPending}
              tabIndex={8}
              size="lg"
              className="mr-2"
            >
              Swap & Add
            </Button>
          ) : baseTokenNeedApproval ? (
            <Button
              onClick={() =>
                onApprove(baseToken, baseAmount, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId])
              }
              disabled={transactionPending}
              tabIndex={8}
              size="lg"
              className="mr-2"
            >
              Approve {baseToken.symbol}
            </Button>
          ) : quoteTokenNeedApproval ? (
            <Button
              onClick={() =>
                onApprove(quoteToken, quoteAmount, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId])
              }
              disabled={transactionPending}
              tabIndex={8}
              size="lg"
              className="mr-2"
            >
              Approve {quoteToken.symbol}
            </Button>
          ) : (
            <Button
              onClick={onAddLiquidity}
              disabled={transactionPending}
              tabIndex={8}
              size="lg"
              className="mr-2"
            >
              Add Liquidity
            </Button>
          )}

          <Button variant="ghost" onClick={onCancel} tabIndex={9}>
            Cancel
          </Button>

          {alert && (
            <Alert level={alert.level} onHide={resetAlert}>
              {alert.message}
            </Alert>
          )}

          {swapAndAddPending && (
            <SwapAndAddModal
              route={swapAndAddRoute}
              token0={quoteToken}
              token1={baseToken}
              token0PreswapAmount={quoteAmount}
              token1PreswapAmount={baseAmount}
              wrapped={depositWrapped}
              onCancel={onSwapAndAddCancel}
              onComplete={onSwapAndAddComplete}
              onApprove={onApprove}
            />
          )}

          {transactionPending && (
            <TransactionModal chainId={chainId} transactionHash={transactionHash} />
          )}
        </div>
      </div>

      <div className="lg:w-1/2">
        <div className="h-64">
          {showFeeTierData && (
            <FeeTierData
              chainId={chainId}
              baseToken={baseToken}
              quoteToken={quoteToken}
              currentValue={fee}
            />
          )}
        </div>

        {showRangeData && (
          <div>
            <RangeData
              chainId={chainId}
              tickLower={tickLower}
              tickUpper={tickUpper}
              baseToken={baseToken}
              quoteToken={quoteToken}
              pool={pool}
            />
          </div>
        )}
      </div>
    </div>
  );
}
export default NewPosition;
