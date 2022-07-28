import React, { useRef } from 'react';
import classNames from 'classnames';

import styles from './styles.module.css';

interface Props {
  name: string | undefined;
  address: string | undefined;
  className?: string | undefined;
  chain?: string | undefined;
  size?: 'xs' | 'sm' | 'lg';
}

function TokenLogo({ chain, name, address, className, size = 'sm' }: Props) {
  const imgEl = useRef<HTMLImageElement>(null);
  const showFallbackImage = () => {
    if (imgEl.current) {
      imgEl.current.src = new URL('../../../public/missing-icon.svg', import.meta.url).toString();
    }
  };

  if (!address) {
    return null;
  }

  return (
    <img
      ref={imgEl}
      className={classNames(styles['logo'], styles[`logo--${size}`], className)}
      alt={`${name} logo`}
      src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${
        chain || 'ethereum'
      }/assets/${address}/logo.png`}
      onError={() => showFallbackImage()}
    />
  );
}

export default TokenLogo;
