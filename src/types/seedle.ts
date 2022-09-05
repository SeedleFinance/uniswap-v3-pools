import { BigNumber } from "@ethersproject/bignumber";
import { Token, Price, CurrencyAmount } from "@uniswap/sdk-core";
import { Pool, Position } from "@uniswap/v3-sdk";

export interface PoolState {
  key: string;
  address: string;
  currentPrice: number;
  quoteToken: Token;
  baseToken: Token;
  entity: Pool;
  poolLiquidity: CurrencyAmount<Token>;
  rawPoolLiquidity: BigNumber;
  poolUncollectedFees: CurrencyAmount<Token>;
  currencyPoolUncollectedFees: CurrencyAmount<Token>[];
  positions: CustomPosition[];
}

export interface CustomPosition {
  id: number;
  entity: Position;
  priceLower?: Price<Token, Token>;
  priceUpper?: Price<Token, Token>;
  positionLiquidity?: CurrencyAmount<Token>;
  uncollectedFees: CurrencyAmount<Token>[];
  positionUncollectedFees: CurrencyAmount<Token>;
  transactions: any[];
}
