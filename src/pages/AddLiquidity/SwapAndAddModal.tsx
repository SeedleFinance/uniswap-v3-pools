import React, { useEffect, useMemo, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Token } from "@uniswap/sdk-core";
import { SwapToRatioRoute } from "@uniswap/smart-order-router";

import { useTokenFunctions } from "../../hooks/useTokenFunctions";
import TokenLabel from "../../ui/TokenLabel";
import TokenLogo from "../../ui/TokenLogo";
import Modal from "../../ui/Modal";
import { Button, UnstyledButton } from "../../ui/Button";
import { formatInput } from "../../utils/numbers";
import { tokenAmountNeedApproval, getApprovalAmount } from "./utils";

import { SWAP_ROUTER_ADDRESSES } from "../../constants";

interface Props {
  token0: Token;
  token1: Token;
  token0PreswapAmount: number;
  token1PreswapAmount: number;
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
  onApprove,
  onCancel,
  onComplete,
}: Props) {
  const { chainId, account } = useWeb3React("injected");
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

    return [token0Amount, token1Amount];
  }, [route, token0, token1, token0PreswapAmount, token1PreswapAmount]);

  const token0NeedApproval = useMemo(() => {
    if (!chainId || !token0 || !route || tokenApproving) {
      return false;
    }

    return tokenAmountNeedApproval(
      chainId as number,
      token0,
      token0Allowance,
      getApprovalAmount(token0PreswapAmount, token0Amount)
    );
  }, [
    chainId,
    token0,
    token0PreswapAmount,
    token0Amount,
    token0Allowance,
    route,
    tokenApproving,
  ]);

  const token1NeedApproval = useMemo(() => {
    if (!chainId || !token1 || !route || tokenApproving) {
      return false;
    }

    return tokenAmountNeedApproval(
      chainId as number,
      token1,
      token1Allowance,
      getApprovalAmount(token1PreswapAmount, token1Amount)
    );
  }, [
    chainId,
    token1,
    token1PreswapAmount,
    token1Amount,
    token1Allowance,
    route,
    tokenApproving,
  ]);

  const handleApprove = async (token: Token, amount: number) => {
    setTokenApproving(true);
    await onApprove(token, amount, SWAP_ROUTER_ADDRESSES[chainId as number]);
    setTokenApproving(false);
  };

  return (
    <Modal title={"Swap & Add"}>
      {!route ? (
        <div>Finding the best route for the swap...</div>
      ) : (
        <div>
          <div>Liquidity to be added after the swap:</div>
          <div>
            <div className="w-full flex flex-wrap items-start p-2 my-1 relative">
              <div className="w-1/3 flex items-center p-1 my-1 justify-between bg-slate-200 dark:bg-slate-600 border rounded">
                <TokenLogo name={token0.name} address={token0.address} />
                <TokenLabel name={token0.name} symbol={token0.symbol} />
              </div>
              <div className="w-2/3 p-2 my-1">{formatInput(token0Amount)}</div>
            </div>

            <div className="w-full flex flex-wrap items-start p-2 my-1 relative">
              <div className="w-1/3 flex items-center p-1 my-1 justify-between bg-slate-200 dark:bg-slate-600 border rounded">
                <TokenLogo name={token1.name} address={token1.address} />
                <TokenLabel name={token1.name} symbol={token1.symbol} />
              </div>
              <div className="w-2/3 p-2 my-1">{formatInput(token1Amount)}</div>
            </div>
          </div>

          <div>
            <div className="text-sm my-2">
              Swap & Add interacts with{" "}
              <a
                className="text-underline text-blue-500"
                href="https://etherscan.io/address/0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45#code"
                target="_blank"
                rel="noreferrer"
              >
                SmartRouter02 contract
              </a>{" "}
              from Uniswap Labs. You may need to approve tokens.
            </div>
            {token0NeedApproval ? (
              <Button
                onClick={() =>
                  handleApprove(
                    token0,
                    getApprovalAmount(token0PreswapAmount, token0Amount)
                  )
                }
                tabIndex={8}
                compact={true}
                className="mr-2"
              >
                Approve {token0.symbol}
              </Button>
            ) : token1NeedApproval ? (
              <Button
                onClick={() =>
                  handleApprove(
                    token1,
                    getApprovalAmount(token1PreswapAmount, token1Amount)
                  )
                }
                tabIndex={8}
                compact={true}
                className="mr-2"
              >
                Approve {token1.symbol}
              </Button>
            ) : (
              <Button
                onClick={onComplete}
                tabIndex={8}
                compact={true}
                className="mr-2"
              >
                Complete Transaction
              </Button>
            )}
            <UnstyledButton onClick={onCancel} tabIndex={9}>
              Cancel
            </UnstyledButton>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default SwapAndAddModal;
