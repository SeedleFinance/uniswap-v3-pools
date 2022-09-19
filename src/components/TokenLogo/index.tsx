import React, { useRef } from 'react';
import classNames from 'classnames';

import styles from './styles.module.css';

interface Props {
  name: string | undefined;
  address: string | undefined;
  className?: string | undefined;
  chain?: string | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  src?: string | undefined;
}
// TODO: add support for FALLBACK IMAGE. We should probably use Next/Image instead (vs img)

function TokenLogo({ chain, name, address, src, className, size = 'sm' }: Props) {
  const imgEl = useRef<HTMLImageElement>(null);
  const showFallbackImage = () => {
    if (imgEl.current) {
      imgEl.current.src = '/icons/missing-icon.svg';
    }
  };

  if (src) {
    return (
      <img
        ref={imgEl}
        className={classNames(className, styles['logo'], styles[`logo--${size}`])}
        alt={`${name} logo`}
        src={src}
        onError={() => showFallbackImage()}
      />
    );
  }

  if (!address) {
    return null;
  }

  return (
    <img
      ref={imgEl}
      className={classNames(className, styles['logo'], styles[`logo--${size}`])}
      alt={`${name} logo`}
      src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${
        chain || 'ethereum'
      }/assets/${address}/logo.png`}
      onError={() => showFallbackImage()}
    />
  );
}

export default TokenLogo;
