import React, { useState, useMemo } from "react";
import { Token } from "@uniswap/sdk-core";
import { BigNumber } from "@ethersproject/bignumber";

import Modal from "../../components/Modal/Modal";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { ROUTES } from "../../common/constants";

interface Props {
  tokenId: BigNumber;
  baseToken: Token;
  quoteToken: Token;
  onCancel: () => void;
  onComplete: (address: string) => void;
}

function TransferModal({
  tokenId,
  baseToken,
  quoteToken,
  onCancel,
  onComplete,
}: Props) {
  const [address, setAddress] = useState("");
  const [askConfirm, setAskConfirm] = useState(false);

  const isTransferDisabled = useMemo(() => {
    return address.length < 1;
  }, [address]);

  const handleInput = (ev: { target: any }) => {
    const val = ev.target.value;
    setAddress(val);
  };

  const handleTransfer = (ev: { target: any; preventDefault: () => void }) => {
    ev.preventDefault();
    if (!askConfirm) {
      setAskConfirm(true);
    } else {
      onComplete(address);
    }
  };

  const handleCancel = () => {
    setAddress("");
    setAskConfirm(false);
    onCancel();
  };

  return (
    <Modal title={"Transfer Position"}>
      <form action={ROUTES.HOME} onSubmit={handleTransfer}>
        {!askConfirm ? (
          <>
            <div className="text-medium">
              Transfer the position{" "}
              <span className="font-bold">
                {quoteToken.symbol} / {baseToken.symbol} ({tokenId.toString()})
              </span>{" "}
              to a different account.
            </div>
            <div className="my-4">
              <Input
                type="text"
                value={address}
                placeholder={"Enter the account address or ENS name"}
                onChange={handleInput}
              />
            </div>
          </>
        ) : (
          <div className="mb-2">
            <div className="my-4 leading-relaxed">
              Are you sure you want to transfer the position{" "}
              <span className="font-bold">{tokenId.toString()}</span> to{" "}
              <span className="bg-slate-100 dark:bg-slate-900 p-1">
                {address}
              </span>
              ?
            </div>
            <div className="my-2">This transaction cannot be reversed.</div>
          </div>
        )}

        <div className="flex">
          <Button onClick={handleCancel} variant="secondary" tabIndex={4}>
            Cancel
          </Button>
          <Button
            type="submit"
            tabIndex={3}
            className="ml-2"
            disabled={isTransferDisabled}
          >
            Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TransferModal;
