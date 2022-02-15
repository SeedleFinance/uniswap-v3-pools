import React, { useMemo, useState } from "react";
import { Token } from "@uniswap/sdk-core";
import { SwapToRatioRoute } from "@uniswap/smart-order-router";

import TokenLabel from "../../ui/TokenLabel";
import TokenLogo from "../../ui/TokenLogo";
import Modal from "../../ui/Modal";
import { Button, UnstyledButton } from "../../ui/Button";
import { formatInput } from "../../utils/numbers";

interface Props {
  token0: Token;
  token1: Token;
  route: SwapToRatioRoute | null;
  onCancel: () => void;
  onComplete: () => void;
}

function SwapAndAddModal({
  token0,
  token1,
  route,
  onCancel,
  onComplete,
}: Props) {
  const [transactionPending, setTransactionPending] = useState<boolean>(false);

  const [token0Amount, token1Amount] = useMemo(() => {
    if (!route) {
      return [0, 0];
    }

    const optimalRatio = route.optimalRatio.toSignificant(18);
    const { quote } = route;

    let token0Amount = 0;
    let token1Amount = 0;
    if (quote.currency.equals(token0)) {
      token0Amount = quote.toSignificant(18);
      token1Amount = token0Amount * optimalRatio;
    } else {
      token1Amount = quote.toSignificant(18);
      token0Amount = token1Amount * optimalRatio;
    }

    return [formatInput(token0Amount), formatInput(token1Amount)];
  }, [route]);

  const token0NeedApproval = false;
  const token1NeedApproval = false;

  const onApprove = () => {};

  return (
    <Modal title={"Swap & Add"}>
      {!route ? (
        <div>Finding the best route for the swap...</div>
      ) : (
        <div>
          <div>Liquidity to be added after the swap:</div>
          <div>
            <div className="w-full flex flex-wrap items-start p-2 my-1 relative">
              <div className="w-1/3 flex items-center p-1 my-1 justify-between bg-slate-200 dark:bg-slate-800 border rounded">
                <TokenLogo name={token0.name} address={token0.address} />
                <TokenLabel name={token0.name} symbol={token0.symbol} />
              </div>
              <div className="w-2/3 p-2 my-1">{token0Amount}</div>
            </div>

            <div className="w-full flex flex-wrap items-start p-2 my-1 relative">
              <div className="w-1/3 flex items-center p-1 my-1 justify-between bg-slate-200 dark:bg-slate-800 border rounded">
                <TokenLogo name={token1.name} address={token1.address} />
                <TokenLabel name={token1.name} symbol={token1.symbol} />
              </div>
              <div className="w-2/3 p-2 my-1">{token1Amount}</div>
            </div>
          </div>

          <div>
            <div className="text-sm my-2">
              Swap & Add interacts with{" "}
              <a
                className="text-underline text-blue-500"
                href="https://etherscan.io/address/0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45#code"
                target="_blank"
              >
                SmartRouter02 contract
              </a>{" "}
              from Uniswap Labs. You may need to approve tokens.
            </div>
            {token0NeedApproval ? (
              <Button
                onClick={() => onApprove(0, token0Amount)}
                disabled={transactionPending}
                tabIndex={8}
                compact={true}
                className="mr-2"
              >
                Approve {token0.symbol}
              </Button>
            ) : token1NeedApproval ? (
              <Button
                onClick={() => onApprove(1, token1Amount)}
                disabled={transactionPending}
                tabIndex={8}
                compact={true}
                className="mr-2"
              >
                Approve {token1Token.symbol}
              </Button>
            ) : (
              <Button
                onClick={onComplete}
                disabled={transactionPending}
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
