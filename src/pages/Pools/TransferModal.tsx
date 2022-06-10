import React, { useState, useMemo } from 'react';
import { Token } from '@uniswap/sdk-core';
import { BigNumber } from '@ethersproject/bignumber';

import Modal from '../../ui/Modal/Modal';
import { Button, UnstyledButton } from '../../ui/Button';
import { ROUTES } from '../../constants';

interface Props {
  tokenId: BigNumber;
  baseToken: Token;
  quoteToken: Token;
  onCancel: () => void;
  onComplete: (address: string) => void;
}

function TransferModal({ tokenId, baseToken, quoteToken, onCancel, onComplete }: Props) {
  const [address, setAddress] = useState('');
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
    setAddress('');
    setAskConfirm(false);
    onCancel();
  };

  return (
    <Modal title={'Transfer Position'}>
      <form action={ROUTES.HOME} onSubmit={handleTransfer}>
        {!askConfirm ? (
          <>
            <div>
              Transfer the position{' '}
              <span className="font-bold">
                {quoteToken.symbol} / {baseToken.symbol} ({tokenId.toString()})
              </span>{' '}
              to a different account.
            </div>
            <div className="my-4">
              <input
                className="w-full focus:outline-none text-lg p-2 bg-white dark:bg-slate-900 border rounded border-gray-400"
                type="text"
                value={address}
                placeholder={'Enter the account address or ENS name'}
                tabIndex={2}
                onChange={handleInput}
              />
            </div>
          </>
        ) : (
          <div className="mb-2">
            <div className="my-4 leading-relaxed">
              Are you sure you want to transfer the position{' '}
              <span className="font-bold">{tokenId.toString()}</span> to{' '}
              <span className="bg-slate-100 dark:bg-slate-900 p-1">{address}</span>?
            </div>
            <div className="my-2">This transaction cannot be reversed.</div>
          </div>
        )}

        <div>
          <Button
            type="submit"
            tabIndex={3}
            compact={true}
            className="mr-2"
            disabled={isTransferDisabled}
          >
            Transfer
          </Button>

          <UnstyledButton onClick={handleCancel} tabIndex={4}>
            Cancel
          </UnstyledButton>
        </div>
      </form>
    </Modal>
  );
}

export default TransferModal;
