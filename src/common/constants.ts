import { Token, Percent } from '@uniswap/sdk-core';
import { BigNumber } from '@ethersproject/bignumber';

function constructSameAddressMap(address: string): {
  [chainId in number]: string;
} {
  return {
    1: address,
    3: address,
    4: address,
    5: address,
    42: address,
    10: address,
    42161: address,
    137: address,
  };
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = constructSameAddressMap(
  '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
);

export const V3UTILS = constructSameAddressMap('0x865A00aC030B8E01657F3BC4a90bfD43a58FD8ba');

export const SWAP_ROUTER_ADDRESSES = constructSameAddressMap(
  '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
);

export const DAI: { [key: number]: Token } = {
  1: new Token(1, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin'),
  10: new Token(10, '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 18, 'DAI', 'Dai Stablecoin'),
  42161: new Token(
    42161,
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
  137: new Token(
    137,
    '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
    18,
    'DAI',
    'Dai Stablecoin (POS)',
  ),
};

export const USDC: { [key: number]: Token } = {
  1: new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C'),
  10: new Token(10, '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', 6, 'USDC', 'USD//C'),
  42161: new Token(
    42161,
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    6,
    'USDC',
    'USD Coin (Arb1)',
  ),
  137: new Token(137, '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', 6, 'USDC', 'USD Coin (PoS)'),
};

export const USDT: { [key: number]: Token } = {
  1: new Token(1, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD'),
  10: new Token(10, '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', 6, 'USDT', 'Tether USD'),
  42161: new Token(42161, '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 6, 'USDT', 'Tether USD'),
  137: new Token(137, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 6, 'USDT', '(PoS) Tether USD'),
};

export const FEI = new Token(1, '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', 18, 'FEI', 'Fei USD');

export const LUSD = new Token(
  1,
  '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
  18,
  'LUSD',
  'LUSD Stablecoin',
);

export const PAX = new Token(
  1,
  '0x8e870d67f660d95d5be530380d0ec0bd388289e1',
  18,
  'PAX',
  'Paxos Standard',
);

export const vUSD = new Token(10, '0xC84Da6c8ec7A57cD10B939E79eaF9d2D17834E04', 18, 'vUSD', 'vUSD');

export const MATIC: { [chainId: number]: Token } = {
  1: new Token(1, '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', 18, 'MATIC', 'Matic Token'),
  137: new Token(137, '0x0000000000000000000000000000000000001010', 18, 'MATIC', 'Matic Token'),
};

export const WETH9: { [chainId: number]: Token } = {
  1: new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'),
  3: new Token(3, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'),
  4: new Token(4, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'),
  5: new Token(5, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', 18, 'WETH', 'Wrapped Ether'),
  42: new Token(42, '0xd0A1E359811322d97991E03f863a0C30C2cF029C', 18, 'WETH', 'Wrapped Ether'),
  10: new Token(10, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
  69: new Token(69, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
  137: new Token(137, '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', 18, 'WETH', 'Wrapped Ether'),
  42161: new Token(
    42161,
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    18,
    'WETH',
    'Wrapped Ether',
  ),
  421611: new Token(
    421611,
    '0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681',
    18,
    'WETH',
    'Wrapped Ether',
  ),
};

export const WMATIC: { [chainId: number]: Token } = {
  1: new Token(
    1,
    '0x7c9f4c87d911613fe9ca58b579f737911aad2d43',
    18,
    'WMATIC',
    'Wrapped Matic Token',
  ),
  137: new Token(
    137,
    '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    18,
    'WMATIC',
    'Wrapped Matic Token',
  ),
};

export const WBTC: { [chainId: number]: Token } = {
  1: new Token(1, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC'),
  137: new Token(137, '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', 8, 'WBTC', '(POS) Wrapped BTC'),
};

export const CRV: { [chainId: number]: Token } = {
  1: new Token(1, '0xD533a949740bb3306d119CC777fa900bA034cd52', 18, 'CRV', 'Curve DAO Token'),
};

export const MaticX: { [key: number]: Token } = {
  1: new Token(1, '0xf03a7eb46d01d9ecaa104558c732cf82f6b6b645', 18, 'MATICX', 'Stader Labs MaticX'),
  137: new Token(
    137,
    '0xfa68fb4628dff1028cfec22b4162fccd0d45efb6',
    18,
    'MATICX',
    'Stader Labs MaticX',
  ),
};

export const DEFAULT_SLIPPAGE = new Percent(50, 10_000);
export const SWAP_SLIPPAGE = new Percent(5, 100);
export const ZERO_PERCENT = new Percent('0');
export const Q128 = BigNumber.from(2).pow(128);

export const BLOCK_EXPLORER_URL: { [key: number]: string } = {
  1: 'https://etherscan.io',
  10: 'https://optimistic.etherscan.io',
  42161: 'https://arbiscan.io',
  137: 'https://polygonscan.com',
};

export const ROUTES = {
  LANDING: '/',
  HOME: '/home',
  ADD: '/add',
  ADD_NEW: '/add?tab=new',
  ADD_EXISTING: '/add?tab=existing',
  ABOUT: '/about',
  POOL_DETAILS: '/pool',
  POOLS: '/pools',
  TOKENS: '/tokens',
  CURRENCIES: '/currencies',
};

export const EXTERNAL_LINKS = {
  TWITTER: 'https://twitter.com/seedleFinance',
  GITHUB: 'https://github.com/SeedleFinance/uniswap-v3-pools',
  GITCOIN: 'https://gitcoin.co/grants/4385/seedle-finance',
  FEEDBACK: 'https://seedle.frill.co',
  DISCORD: 'https://discord.gg/c4NHs77G3B',
};

export const LABELS = {
  FEE_APY: 'Annualized fees earned over liquidity',
  NET_RETURN: 'Liquidity gain + fees - gas cost',
  NET_APY: 'Net Annual Percentage Yield',
  POSITION: {
    OUT_OF_RANGE: 'This position is not earning fees',
  },
  LIQUIDITY: 'Total liquidity for a position, excluding fees',
};
