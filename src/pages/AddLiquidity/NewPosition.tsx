import React, { useState, useEffect, useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import { useSearchParams } from "react-router-dom";
import {
  TickMath,
  tickToPrice,
  NonfungiblePositionManager,
  Position,
} from "@uniswap/v3-sdk";
import { Token, CurrencyAmount, Ether, Fraction } from "@uniswap/sdk-core";
import { BigNumber } from "@ethersproject/bignumber";
import {
  AlphaRouter,
  SwapToRatioStatus,
  SwapToRatioRoute,
} from "@uniswap/smart-order-router";

import { useTokenFunctions } from "../../hooks/useTokenFunctions";
import { usePool } from "../../hooks/usePool";
import { useChainWeb3React } from "../../hooks/useChainWeb3React";
import { getNetworkConnector } from "../../utils/connectors";
import { useCurrencyConversions } from "../../CurrencyConversionsProvider";
import PoolButton from "../../ui/PoolButton";
import TokenLabel from "../../ui/TokenLabel";
import Alert, { AlertLevel } from "../../ui/Alert";
import Modal from "../../ui/Modal";
import { Button, UnstyledButton } from "../../ui/Button";
import Toggle from "../../ui/Toggle";
import { WETH9 } from "../../constants";

import {
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  SWAP_ROUTER_ADDRESSES,
  DEFAULT_SLIPPAGE,
  SWAP_SLIPPAGE,
  ZERO_PERCENT,
  BLOCK_EXPLORER_URL,
} from "../../constants";

import { formatInput } from "../../utils/numbers";

import RangeInput from "./RangeInput";
import DepositInput from "./DepositInput";
import FeeButton from "./FeeButton";
import SwapAndAddModal from "./SwapAndAddModal";
import {
  positionFromAmounts,
  calculateNewAmounts,
  positionDistance,
  tokenAmountNeedApproval,
  toCurrencyAmount,
  findMatchingPosition,
  findPositionById,
} from "./utils";

interface Props {
  baseToken: Token;
  quoteToken: Token;
  initFee: number;
  positions: any[] | null;
  onCancel: () => void;
}

function NewPosition({
  baseToken,
  quoteToken,
  initFee,
  positions,
  onCancel,
}: Props) {
  const { chainId, account, library } = useWeb3React("injected");
  const chainWeb3React = useChainWeb3React(chainId as number);
  const [searchParams] = useSearchParams();
  const positionId = searchParams.get("position");

  useEffect(() => {
    if (!chainId) {
      return;
    }

    if (!chainWeb3React.active) {
      const networkConnector = getNetworkConnector();
      networkConnector.changeChainId(chainId);

      chainWeb3React.activate(networkConnector, (err) => {
        console.error(err);
      });
    }
  }, [chainId, chainWeb3React]);

  const { getBalances, getAllowances, approveToken } = useTokenFunctions(
    [baseToken, quoteToken],
    account
  );
  const { convertToGlobalFormatted } = useCurrencyConversions();

  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [quoteAmount, setQuoteAmount] = useState<number>(0);
  const [fee, setFee] = useState<number>(initFee);

  const { pool } = usePool(baseToken, quoteToken, fee);

  const [tickLower, setTickLower] = useState<number>(TickMath.MIN_TICK);
  const [tickUpper, setTickUpper] = useState<number>(TickMath.MIN_TICK);

  const [baseBalance, setBaseBalance] = useState<string>("0");
  const [quoteBalance, setQuoteBalance] = useState<string>("0");

  const [baseTokenDisabled, setBaseTokenDisabled] = useState<boolean>(false);
  const [quoteTokenDisabled, setQuoteTokenDisabled] = useState<boolean>(false);

  const [baseTokenAllowance, setBaseTokenAllowance] = useState<number>(0);
  const [quoteTokenAllowance, setQuoteTokenAllowance] = useState<number>(0);

  const [transactionPending, setTransactionPending] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const [swapAndAdd, setSwapAndAdd] = useState<boolean>(false);
  const [swapAndAddPending, setSwapAndAddPending] = useState<boolean>(false);
  const [swapAndAddRoute, setSwapAndAddRoute] =
    useState<SwapToRatioRoute | null>(null);

  const [focusedRangeInput, setFocusedRangeInput] =
    useState<HTMLInputElement | null>(null);
  const [alert, setAlert] =
    useState<{ message: string; level: AlertLevel } | null>(null);

  useEffect(() => {
    const _run = async () => {
      const [bal0, bal1] = await getBalances();
      setBaseBalance(formatInput(parseFloat(bal0)));
      setQuoteBalance(formatInput(parseFloat(bal1)));
    };
    _run();
  }, [getBalances]);

  useEffect(() => {
    if (!chainId || !getAllowances) {
      return;
    }

    const _run = async () => {
      const spender = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId as number];
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
      tickLower =
        Math.round((tickCurrent - 10 * tickSpacing) / tickSpacing) *
        tickSpacing;
      tickUpper =
        Math.round((tickCurrent + 10 * tickSpacing) / tickSpacing) *
        tickSpacing;
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

    const { tickCurrent } = pool;

    let [lower, upper] = [tickLower, tickUpper];
    if (rangeReverse) {
      [lower, upper] = [tickUpper, tickLower];
    }

    const token0Disabled = tickCurrent > upper;
    const token1Disabled = tickCurrent < lower;

    setBaseTokenDisabled(
      pool.token0.equals(baseToken) ? token0Disabled : token1Disabled
    );
    setQuoteTokenDisabled(
      pool.token1.equals(quoteToken) ? token1Disabled : token0Disabled
    );
  }, [pool, tickLower, tickUpper, baseToken, quoteToken, rangeReverse]);

  const baseTokenNeedApproval = useMemo(() => {
    if (!chainId || !baseToken) {
      return false;
    }

    return tokenAmountNeedApproval(
      chainId as number,
      baseToken,
      baseTokenAllowance,
      baseAmount
    );
  }, [chainId, baseToken, baseAmount, baseTokenAllowance]);

  const quoteTokenNeedApproval = useMemo(() => {
    if (!chainId || !quoteToken) {
      return false;
    }

    return tokenAmountNeedApproval(
      chainId as number,
      quoteToken,
      quoteTokenAllowance,
      quoteAmount
    );
  }, [chainId, quoteToken, quoteAmount, quoteTokenAllowance]);

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
      rangeReverse
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
      return "0";
    }

    const { tickCurrent } = pool;
    const price = parseFloat(
      tickToPrice(quoteToken, baseToken, tickCurrent).toSignificant(16)
    );

    return formatInput(price);
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
        throw new Error(
          `You don't have enough ${quoteToken.symbol} to complete the transaction`
        );
      }

      if (baseAmount > 0 && baseAmount > parseFloat(baseBalance)) {
        throw new Error(
          `You don't have enough ${baseToken.symbol} to complete the transaction`
        );
      }

      const router = new AlphaRouter({
        chainId: chainId as number,
        provider: chainWeb3React.library,
      });

      const token0Balance = rangeReverse
        ? toCurrencyAmount(baseToken, baseAmount)
        : toCurrencyAmount(quoteToken, quoteAmount);
      const token1Balance = rangeReverse
        ? toCurrencyAmount(quoteToken, quoteAmount)
        : toCurrencyAmount(baseToken, baseAmount);

      const matchingPosition = findMatchingPosition(
        positions,
        fee,
        tickLower,
        tickUpper
      );
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
        ratioErrorTolerance: new Fraction(1, 100),
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
        opts
      );

      if (routerResult.status === SwapToRatioStatus.NO_ROUTE_FOUND) {
        console.error(routerResult.error);
        throw new Error("Failed to find a route to swap");
      } else if (routerResult.status === SwapToRatioStatus.NO_SWAP_NEEDED) {
        // TODO: call regular add liquidity
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
        throw new Error("Swap and Add: no valid route found");
      }

      const tx = {
        to: SWAP_ROUTER_ADDRESSES[chainId as number],
        value: BigNumber.from(route.methodParameters.value),
        data: route.methodParameters.calldata,
        gasPrice: BigNumber.from(route.gasPriceWei),
      };

      const estimatedGas = await library.getSigner().estimateGas(tx);
      const res = await library.getSigner().sendTransaction({
        ...tx,
        gasLimit: estimatedGas
          .mul(BigNumber.from(10000 + 2000))
          .div(BigNumber.from(10000)),
      });

      if (res) {
        setTransactionHash(res.hash);
        await res.wait();
        setAlert({
          message: "Liquidity added to the pool.",
          level: AlertLevel.Success,
        });
      }
    } catch (e: any) {
      handleTxError(e);
    }
    setSwapAndAddPending(false);
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
        throw new Error(
          `You don't have enough ${quoteToken.symbol} to complete the transaction`
        );
      }

      if (baseAmount > 0 && baseAmount > parseFloat(baseBalance)) {
        throw new Error(
          `You don't have enough ${baseToken.symbol} to complete the transaction`
        );
      }

      // see if the current tick range  and pool match an existing position,
      // if match found, call increaseLiquidity
      // otherwise call mint
      const matchingPosition = findMatchingPosition(
        positions,
        fee,
        tickLower,
        tickUpper
      );

      const newPosition = positionFromAmounts(
        {
          pool,
          tickLower,
          tickUpper,
          val0: quoteAmount,
          val1: baseAmount,
        },
        rangeReverse
      );

      const deadline = +new Date() + 10 * 60 * 1000; // TODO: use current blockchain timestamp
      const slippageTolerance =
        baseTokenDisabled || quoteTokenDisabled
          ? ZERO_PERCENT
          : DEFAULT_SLIPPAGE;
      const useNative =
        pool.token0.equals(WETH9[chainId as number]) ||
        pool.token1.equals(WETH9[chainId as number])
          ? pool.token0.chainId !== 137
            ? Ether.onChain(chainId as number)
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
        to: NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId as number],
        data: calldata,
        value,
      };

      const estimatedGas = await library.getSigner().estimateGas(tx);
      const res = await library.getSigner().sendTransaction({
        ...tx,
        gasLimit: estimatedGas
          .mul(BigNumber.from(10000 + 2000))
          .div(BigNumber.from(10000)),
      });
      if (res) {
        setTransactionHash(res.hash);
        await res.wait();
        setAlert({
          message: "Liquidity added to the pool.",
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
          message: "Token approval confirmed.",
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
      focusedRangeInput.setRangeText(currentPrice, 0, curLength, "start");
      focusedRangeInput.dispatchEvent(new Event("input", { bubbles: true }));
      focusedRangeInput.focus();
    }
  };

  return (
    <div className="w-1/2 text-slate-600 dark:text-slate-300">
      <div className="flex flex-col my-2">
        <div>Pair</div>
        <div className="w-80 my-2 p-2 text-lg border rounded border-blue-400 dark:border-slate-700 bg-blue-100 dark:bg-slate-700">
          <PoolButton
            baseToken={baseToken}
            quoteToken={quoteToken}
            onClick={() => {}}
            tabIndex={0}
          />
        </div>
      </div>

      <div className="flex flex-col my-2">
        <div>Fee tier</div>
        <div className="w-64 my-2 flex justify-between">
          <FeeButton
            fee={0.01}
            selected={fee === 100}
            onClick={() => setFee(100)}
            tabIndex={1}
          />
          <FeeButton
            fee={0.05}
            selected={fee === 500}
            onClick={() => setFee(500)}
            tabIndex={2}
          />
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

      <div className="flex flex-col my-2 w-full">
        <div>Range</div>
        <div className="text-sm py-1">
          Current price:{" "}
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
        <div className="w-3/4 flex justify-between">
          <div>Deposit</div>
          <div>
            <Toggle
              label="Swap & Add"
              onChange={() => setSwapAndAdd(!swapAndAdd)}
              checked={swapAndAdd}
            />
          </div>
        </div>
        <div className="w-3/4 my-2">
          <DepositInput
            token={quoteToken}
            value={quoteAmount}
            balance={quoteBalance}
            tabIndex={6}
            disabled={quoteTokenDisabled}
            onChange={quoteDepositChange}
          />
          <DepositInput
            token={baseToken}
            value={baseAmount}
            balance={baseBalance}
            tabIndex={7}
            disabled={baseTokenDisabled}
            onChange={baseDepositChange}
          />
        </div>
        <div className="w-64 mb-2 text-sm">
          Total position value:{" "}
          <span className="font-bold">
            {convertToGlobalFormatted(totalPositionValue)}
          </span>
        </div>
      </div>

      <div className="w-64 my-2 flex">
        {swapAndAdd ? (
          <Button
            onClick={onSwapAndAddLiquidity}
            disabled={transactionPending}
            tabIndex={8}
            compact={true}
            className="mr-2"
          >
            Swap & Add
          </Button>
        ) : baseTokenNeedApproval ? (
          <Button
            onClick={() =>
              onApprove(
                baseToken,
                baseAmount,
                NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId as number]
              )
            }
            disabled={transactionPending}
            tabIndex={8}
            compact={true}
            className="mr-2"
          >
            Approve {baseToken.symbol}
          </Button>
        ) : quoteTokenNeedApproval ? (
          <Button
            onClick={() =>
              onApprove(
                quoteToken,
                quoteAmount,
                NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId as number]
              )
            }
            disabled={transactionPending}
            tabIndex={8}
            compact={true}
            className="mr-2"
          >
            Approve {quoteToken.symbol}
          </Button>
        ) : (
          <Button
            onClick={onAddLiquidity}
            disabled={transactionPending}
            tabIndex={8}
            compact={true}
            className="mr-2"
          >
            Add Liquidity
          </Button>
        )}

        <UnstyledButton onClick={onCancel} tabIndex={9}>
          Cancel
        </UnstyledButton>

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
            onCancel={onSwapAndAddCancel}
            onComplete={onSwapAndAddComplete}
            onApprove={onApprove}
          />
        )}

        {transactionPending && (
          <Modal
            title={
              transactionHash
                ? "Waiting for confirmation"
                : "Complete Transaction"
            }
          >
            {transactionHash ? (
              <div>
                Waiting for transaction to be confirmed. Check status on{" "}
                <a
                  className="text-blue-500"
                  target="_blank"
                  rel="noreferrer"
                  href={`${
                    BLOCK_EXPLORER_URL[chainId as number]
                  }/tx/${transactionHash}`}
                >
                  Etherscan
                </a>
              </div>
            ) : (
              <div>Complete the transaction in your wallet.</div>
            )}
          </Modal>
        )}
      </div>
    </div>
  );
}

export default NewPosition;
