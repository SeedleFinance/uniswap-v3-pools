import { Currency, NativeCurrency, Token } from "@uniswap/sdk-core";

import { WMATIC } from "../common/constants";

function isMatic(chainId: number) {
  return chainId === 137;
}

export default class MaticNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }

  get wrapped(): Token {
    if (!isMatic(this.chainId)) throw new Error("Not matic");
    const nativeCurrency = WMATIC[this.chainId];
    if (nativeCurrency) {
      return nativeCurrency;
    }
    throw new Error(`Does not support this chain ${this.chainId}`);
  }

  public constructor(chainId: number) {
    if (!isMatic(chainId)) throw new Error("Not matic");
    super(chainId, 18, "MATIC", "Polygon Matic");
  }
}
