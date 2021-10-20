import React, { useState, useEffect, useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import {
  TickMath,
  tickToPrice,
  NonfungiblePositionManager,
} from "@uniswap/v3-sdk";
import { Token, WETH9, Ether } from "@uniswap/sdk-core";
import { BigNumber } from "@ethersproject/bignumber";

import { useTokenFunctions } from "../../hooks/useTokenFunctions";
import { usePool } from "../../hooks/usePool";
import PoolButton from "../../ui/PoolButton";
import TokenLabel from "../../ui/TokenLabel";
import Alert, { AlertLevel } from "../../ui/Alert";
import Modal from "../../ui/Modal";
import { Button, UnstyledButton } from "../../ui/Button";

import {
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  DEFAULT_SLIPPAGE,
  ZERO_PERCENT,
} from "../../constants";

import { formatInput } from "../../utils/numbers";

import RangeInput from "./RangeInput";
import DepositInput from "./DepositInput";
import FeeButton from "./FeeButton";
import {
  positionFromAmounts,
  calculateNewAmounts,
  positionDistance,
  tokenAmountNeedApproval,
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
  const { chainId, account, library } = useWeb3React();
  const { getBalances, getAllowances, approveToken } = useTokenFunctions(
    [baseToken, quoteToken],
    account
  );

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
      let sortedPositions = positions.sort((posA, posB) => {
        const disA = positionDistance(tickCurrent, posA);
        const disB = positionDistance(tickCurrent, posB);
        return disA - disB;
      });

      tickLower = sortedPositions[0].entity.tickLower;
      tickUpper = sortedPositions[0].entity.tickUpper;
    }

    if (rangeReverse) {
      return [tickUpper, tickLower];
    }
    return [tickLower, tickUpper];
  }, [pool, positions, rangeReverse]);

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

  const calculateBaseAndQuoteAmounts = (val0: number, val1: number) => {
    if (!pool) {
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
      return 0;
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
      let matchingPosition = null;
      if (positions) {
        matchingPosition = positions.find((position) => {
          const { entity } = position;
          if (
            entity.pool.fee === fee &&
            entity.tickLower === tickLower &&
            entity.tickUpper === tickUpper
          ) {
            return true;
          }
          return false;
        });
      }

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

      const deadline = +new Date() + 120 * 60; // TODO: use current blockchain timestamp
      const slippageTolerance =
        baseTokenDisabled || quoteTokenDisabled
          ? ZERO_PERCENT
          : DEFAULT_SLIPPAGE;
      const useNative =
        pool.token0.equals(WETH9[chainId as number]) ||
        pool.token1.equals(WETH9[chainId as number])
          ? Ether.onChain(chainId as number)
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
        setTransactionPending(false);
      }
    } catch (e) {
      console.error(e);
      if (e.error) {
        setAlert({
          message: `Transaction failed. (reason: ${e.error.message} code: ${e.error.code})`,
          level: AlertLevel.Error,
        });
      } else {
        setAlert({
          message: e.toString(),
          level: AlertLevel.Error,
        });
      }
      setTransactionPending(false);
    }
  };

  const onApprove = async (idx: number, amount: number) => {
    setTransactionPending(true);
    try {
      const spender = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId as number];
      const res = await approveToken(idx, spender, amount);
      if (res) {
        setTransactionHash(res.hash);
        await res.wait();
        setAlert({
          message: "Token approval confirmed.",
          level: AlertLevel.Success,
        });
        setTransactionPending(false);
      }
    } catch (e) {
      console.error(e);
      if (e.error) {
        setAlert({
          message: `Transaction failed. (reason: ${e.error.message} code: ${e.error.code})`,
          level: AlertLevel.Error,
        });
      } else {
        setAlert({
          message: e.toString(),
          level: AlertLevel.Error,
        });
      }
      setTransactionPending(false);
    }
  };

  const resetAlert = () => {
    setAlert(null);
  };

  return (
    <div className="w-1/2">
      <div className="flex flex-col my-2">
        <div>Pair</div>
        <div className="w-80 my-2 p-2 text-lg border rounded border-blue-400 bg-blue-100">
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
        <div className="w-48 my-2 flex justify-between">
          <FeeButton
            fee={0.05}
            selected={fee === 500}
            onClick={() => setFee(500)}
            tabIndex={1}
          />
          <FeeButton
            fee={0.3}
            selected={fee === 3000}
            onClick={() => setFee(3000)}
            tabIndex={2}
          />
          <FeeButton
            fee={1}
            selected={fee === 10000}
            onClick={() => setFee(10000)}
            tabIndex={3}
          />
        </div>
      </div>

      <div className="flex flex-col my-2 w-full">
        <div>Range</div>
        <div className="text-sm">
          Current price: <span className="font-bold">{currentPrice}&nbsp;</span>
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
          />
        </div>
      </div>

      <div className="flex flex-col my-2">
        <div>Deposit</div>
        <div className="w-80 my-2">
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
      </div>

      <div className="w-48 my-2 flex justify-between">
        {baseTokenNeedApproval ? (
          <Button
            onClick={() => onApprove(0, baseAmount)}
            disabled={transactionPending}
            tabIndex={8}
            compact={true}
          >
            Approve {baseToken.symbol}
          </Button>
        ) : quoteTokenNeedApproval ? (
          <Button
            onClick={() => onApprove(1, quoteAmount)}
            disabled={transactionPending}
            tabIndex={8}
            compact={true}
          >
            Approve {quoteToken.symbol}
          </Button>
        ) : (
          <Button
            onClick={onAddLiquidity}
            disabled={transactionPending}
            tabIndex={8}
            compact={true}
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

        {transactionPending && (
          <Modal
            title={
              transactionHash
                ? "Complete Transaction"
                : "Waiting for confirmation"
            }
          >
            {transactionHash ? (
              <div>
                Waiting for transaction to be confirmed. Check status on{" "}
                <a
                  className="text-blue-500"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://etherscan.io/tx/${transactionHash}`}
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
