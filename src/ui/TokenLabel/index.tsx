import React, { useMemo } from 'react';
import classNames from 'classnames';

import { TokenSize } from '../PoolButton';
import styles from './styles.module.css';

export interface TokenProps {
  name?: string | undefined;
  symbol?: string | undefined;
  wrapped?: boolean;
  size?: TokenSize;
  className?: string;
}

function TokenLabel({ name, symbol, wrapped, size = 'sm', className }: TokenProps) {
  const label = useMemo(() => {
    const symbolOrName = symbol || name;
    if (!symbolOrName) {
      return '';
    }

    if (symbolOrName.startsWith('WETH') && !wrapped) {
      return 'ETH';
    }
    if (symbolOrName.startsWith('WMATIC') && !wrapped) {
      return 'MATIC';
    }
    return symbolOrName;
  }, [name, symbol, wrapped]);

  return (
    <span
      className={classNames('pr-1 font-medium text-high', styles[`label--${size}`], className)}
      title={name}
    >
      {label}
    </span>
  );
}

export default TokenLabel;
