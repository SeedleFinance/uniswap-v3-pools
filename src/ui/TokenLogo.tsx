import React, { useRef } from "react";

interface Props {
  name: string | undefined;
  address: string | undefined;
}

function TokenLogo({ name, address }: Props) {
  const imgEl = useRef<HTMLImageElement>(null);
  const showFallbackImage = () => {
    if (imgEl.current) {
      imgEl.current.src = "/missing-icon.svg";
    }
  };

  if (!address) {
    return null;
  }

  return (
    <img
      ref={imgEl}
      className="w-8 h-8 rounded-full bg-white text-sm"
      alt={`${name} logo`}
      src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`}
      onError={() => showFallbackImage()}
    />
  );
}

export default TokenLogo;
