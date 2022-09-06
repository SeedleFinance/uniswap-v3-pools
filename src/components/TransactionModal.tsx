import React from 'react';

import { BLOCK_EXPLORER_URL } from '../common/constants';
import Modal from './Modal/Modal';

interface Props {
  chainId: number | undefined;
  transactionHash: string | null;
}

function TransactionModal({ chainId, transactionHash }: Props) {
  return (
    <Modal title={transactionHash ? 'Waiting for confirmation' : 'Complete Transaction'}>
      {transactionHash ? (
        <div className="text-medium">
          Waiting for transaction to be confirmed. Check status on{' '}
          <a
            className="text-blue-500"
            target="_blank"
            rel="noreferrer"
            href={`${BLOCK_EXPLORER_URL[chainId as number]}/tx/${transactionHash}`}
          >
            Explorer
          </a>
        </div>
      ) : (
        <div className="text-medium">Complete the transaction in your wallet.</div>
      )}
    </Modal>
  );
}

export default TransactionModal;
