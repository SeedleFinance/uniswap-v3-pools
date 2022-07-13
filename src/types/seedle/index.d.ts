import { Token, Price, CurrencyAmount } from '@uniswap/sdk-core';
import { Position } from '@uniswap/v3-sdk';

export interface CustomPosition {
  id: number;
  entity: Position;
  priceLower?: Price<Token, Token>;
  priceUpper?: Price<Token, Token>;
  positionLiquidity?: CurrencyAmount<Token>;
  uncollectedFees: CurrencyAmount<Token>[];
  positionUncollectedFees: CurrencyAmount<Token>;
}
