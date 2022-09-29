import React, { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { Token, Currency } from '@uniswap/sdk-core';
import { SwapToRatioRoute } from '@uniswap/smart-order-router';

import { useChainId } from '../../hooks/useChainId';
import { useTokenFunctions } from '../../hooks/useTokenFunctions';
import TokenLabel from '../TokenLabel';
import TokenLogo from '../TokenLogo';
import Modal from '../Modal/Modal';
import Button from '../Button';
import { formatInput } from '../../utils/numbers';
import { tokenAmountNeedApproval, getApprovalAmount } from './utils';

import { WETH9, SWAP_ROUTER_ADDRESSES } from '../../common/constants';
import LoadingSpinner from '../Spinner';

interface Props {
  token0: Token;
  token1: Token;
  token0PreswapAmount: number;
  token1PreswapAmount: number;
  wrapped: boolean;
  route: SwapToRatioRoute | null;
  onCancel: () => void;
  onComplete: () => void;
  onApprove: (token: Token, amount: number, spender: string) => void;
}

function SwapAndAddModal({
  token0,
  token1,
  token0PreswapAmount,
  token1PreswapAmount,
  route,
  wrapped,
  onApprove,
  onCancel,
  onComplete,
}: Props) {
  const chainId = useChainId();
  const { address: account } = useAccount();
  const { getAllowances } = useTokenFunctions([token0, token1], account);

  const [tokenApproving, setTokenApproving] = useState<boolean>(false);

  const [token0Allowance, setToken0Allowance] = useState<number>(0);
  const [token1Allowance, setToken1Allowance] = useState<number>(0);

  useEffect(() => {
    if (!chainId || !getAllowances || tokenApproving) {
      return;
    }

    const _run = async () => {
      const spender = SWAP_ROUTER_ADDRESSES[chainId as number];
      const [val0, val1] = await getAllowances(spender);
      setToken0Allowance(val0);
      setToken1Allowance(val1);
    };

    _run();
  }, [getAllowances, chainId, tokenApproving]);

  const [token0Amount, token1Amount] = useMemo(() => {
    if (!route) {
      return [0, 0];
    }

    const { quote, postSwapTargetPool: pool } = route;
    const quoteAmount = parseFloat(quote.toSignificant(18));

    let token0Amount = 0;
    let token1Amount = 0;
    if (quote.currency.equals(token0)) {
      token0Amount = token0PreswapAmount + quoteAmount;
      token1Amount =
        token1PreswapAmount -
        parseFloat(pool.priceOf(token0).quote(quote.wrapped).toSignificant(18));
    } else {
      token1Amount = token1PreswapAmount + quoteAmount;
      token0Amount =
        token0PreswapAmount -
        parseFloat(pool.priceOf(token1).quote(quote.wrapped).toSignificant(18));
    }

    return [Math.max(0, token0Amount), Math.max(0, token1Amount)];
  }, [route, token0, token1, token0PreswapAmount, token1PreswapAmount]);

  const token0NeedApproval = useMemo(() => {
    if (!chainId || !token0 || !route || tokenApproving) {
      return false;
    }

    return tokenAmountNeedApproval(
      chainId as number,
      token0,
      token0Allowance,
      getApprovalAmount(token0PreswapAmount, token0Amount),
      wrapped,
    );
  }, [
    chainId,
    token0,
    token0PreswapAmount,
    token0Amount,
    token0Allowance,
    route,
    tokenApproving,
    wrapped,
  ]);

  const token1NeedApproval = useMemo(() => {
    if (!chainId || !token1 || !route || tokenApproving) {
      return false;
    }

    return tokenAmountNeedApproval(
      chainId as number,
      token1,
      token1Allowance,
      getApprovalAmount(token1PreswapAmount, token1Amount),
      wrapped,
    );
  }, [
    chainId,
    token1,
    token1PreswapAmount,
    token1Amount,
    token1Allowance,
    route,
    tokenApproving,
    wrapped,
  ]);

  const [swapInput, swapOutput] = useMemo(() => {
    if (!route || !route.trade || !route.trade.swaps) {
      return [null, null];
    }

    const { swaps } = route.trade;
    const firstSwap = swaps[0];
    let swapInput = firstSwap.inputAmount;
    let swapOutput = firstSwap.outputAmount;

    for (let i = 1; i < swaps.length; i++) {
      swapInput = swapInput.add(swaps[i].inputAmount);
      swapOutput = swapOutput.add(swaps[i].outputAmount);
    }

    return [swapInput, swapOutput];
  }, [route]);

  const handleApprove = async (token: Token, amount: number) => {
    setTokenApproving(true);
    await onApprove(token, amount, SWAP_ROUTER_ADDRESSES[chainId as number]);
    setTokenApproving(false);
  };

  const getCurrencyAddress = (currency: Currency) => {
    if (currency.isNative && currency.name === 'Ether') {
      return WETH9[chainId || 1].address;
    }

    return (currency as Token).address;
  };

  const isLoading = !swapInput || !swapOutput;
  return (
    <Modal title={isLoading ? '' : 'Swap & Add'}>
      {isLoading ? (
        <div className="flex justify-center items-center">
          <LoadingSpinner />
          <div className="text-medium ml-2">Finding the best route for the swap...</div>
        </div>
      ) : (
        <div>
          <div className="text-medium">
            <div className="text-high font-medium">Your Swap:</div>
            <div className="flex item-center p-2">
              <div className="grow flex flex-wrap items-center my-1 relative">
                <div className="w-1/2 flex items-center p-1 my-1 justify-between bg-slate-200 dark:bg-slate-600 border-element-10 rounded">
                  <TokenLogo
                    name={swapInput.currency.name}
                    address={getCurrencyAddress(swapInput.currency)}
                  />
                  <TokenLabel
                    name={swapInput.currency.name}
                    symbol={swapInput.currency.symbol}
                    wrapped={wrapped}
                  />
                </div>
                <div className="w-1/2 p-2 my-1">
                  {formatInput(parseFloat(swapInput.toSignificant(18)))}
                </div>
              </div>

              <div className="grow-0 p-4">→</div>

              <div className="grow flex flex-wrap items-center my-1 relative">
                <div className="w-1/2 flex items-center p-1 my-1 justify-between bg-slate-200 dark:bg-slate-600 border-element-10 rounded">
                  <TokenLogo
                    name={swapOutput.currency.name}
                    address={getCurrencyAddress(swapOutput.currency)}
                  />
                  <TokenLabel
                    name={swapOutput.currency.name}
                    symbol={swapOutput.currency.symbol}
                    wrapped={wrapped}
                  />
                </div>
                <div className="w-1/2 p-2 my-1">
                  {formatInput(parseFloat(swapOutput.toSignificant(18)))}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-element-10 py-6">
            <div className="text-high font-medium">Liquidity to be added after the swap:</div>
            <div>
              <div className="w-full flex flex-wrap items-center p-2 my-1 relative text-medium">
                <div className="w-1/3 flex items-center p-1 my-1 justify-between bg-surface-10 border-element-10 rounded">
                  <TokenLogo name={token0.name} address={token0.address} />
                  <TokenLabel name={token0.name} symbol={token0.symbol} wrapped={wrapped} />
                </div>
                <div className="w-2/3 p-2 my-1">{formatInput(token0Amount)}</div>
              </div>

              <div className="w-full flex flex-wrap items-center p-2 my-1 relative text-medium">
                <div className="w-1/3 flex items-center p-1 my-1 justify-between bg-surface-10 border-element-10 border rounded">
                  <TokenLogo name={token1.name} address={token1.address} />
                  <TokenLabel name={token1.name} symbol={token1.symbol} wrapped={wrapped} />
                </div>
                <div className="w-2/3 p-2 my-1">{formatInput(token1Amount)}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="py-2 text-0.8125 text-high border-element-10 border px-4">
              Swap & Add interacts with the{' '}
              <a
                className="text-underline text-blue-500"
                href="https://etherscan.io/address/0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45#code"
                target="_blank"
                rel="noreferrer"
              >
                SmartRouter02 contract
              </a>{' '}
              from Uniswap Labs. <br />
              You may need to approve tokens.
            </div>
            <div className="flex justify-end mt-4">
              <Button
                onClick={onCancel}
                tabIndex={9}
                variant="secondary"
                size="lg"
                className="mr-2"
              >
                Cancel
              </Button>
              {token0NeedApproval ? (
                <Button
                  onClick={() =>
                    handleApprove(token0, getApprovalAmount(token0PreswapAmount, token0Amount))
                  }
                  tabIndex={8}
                  size="lg"
                  className="mr-2"
                >
                  Approve {token0.symbol}
                </Button>
              ) : token1NeedApproval ? (
                <Button
                  onClick={() =>
                    handleApprove(token1, getApprovalAmount(token1PreswapAmount, token1Amount))
                  }
                  tabIndex={8}
                  size="lg"
                  className="mr-2"
                >
                  Approve {token1.symbol}
                </Button>
              ) : (
                <Button onClick={onComplete} tabIndex={8} size="lg" className="mr-2">
                  Complete Transaction
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default SwapAndAddModal;
