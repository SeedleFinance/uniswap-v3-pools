import React from 'react';

import { ChainID } from '../../types/enums';

import { useTokens } from '../../providers/CombinedTokensProvider';
import { getChainNameAndColor } from '../../utils/chains';
import { useCurrencyConversions } from '../../providers/CurrencyConversionProvider';

import BackArrow from '../../components/icons/LeftArrow';
import LoadingSpinner from '../../components/Spinner';
import TokenLogo from '../../components/TokenLogo';
import { ROUTES } from '../../common/constants';
import Card from '../../components/Card';
import Link from 'next/link';

const TokensPage = () => {
  const { convertToGlobalFormatted, formatCurrencyWithSymbol } = useCurrencyConversions();
  const { loading, tokens, totalTokenValue } = useTokens();

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!tokens) {
    return <div>You do not have any tokens.</div>;
  }

  return (
    <div>
      <div className="flex justify-between">
        <Link
          href={`${ROUTES.HOME}${location.search}`}
          className="text-0.875 font-medium text-medium flex items-center"
        >
          <a className="flex items-center">
            <BackArrow />
            <span className="ml-2">Home</span>
          </a>
        </Link>
        <div>
          <Card>
            <div className="text-0.875 text-brand-dark-primary">Total Value</div>
            <div className="text-1.25 md:text-1.75 my-1 font-semibold">
              {formatCurrencyWithSymbol(totalTokenValue, ChainID.Mainnet)}
            </div>
          </Card>
        </div>
      </div>
      <h1 className="text-2.5 font-bold tracking-tighter leading-tight mt-4 text-high">Tokens</h1>
      <div className="pb-8 overflow-x-auto">
        <table className="text-high w-full mt-4">
          <thead className="border-b border-element-10">
            <tr className="align-middle">
              <th className="md:px-6 py-4 whitespace-nowrap font-medium text-left text-0.875">
                Token
              </th>
              <th className="text-right px-6 py-4 whitespace-nowrap font-medium text-0.875">
                Balance
              </th>
              <th className="text-right px-6 py-4 whitespace-nowrap font-medium text-0.875">
                Current Price
              </th>
              <th className="text-right px-6 py-4 whitespace-nowrap font-medium text-0.875">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="text-0.875">
            {tokens.map((token, index) => (
              <tr
                key={`${token.name}-${index}`}
                className="w-full hover:bg-surface-10 cursor-pointer"
              >
                <td className="md:px-6 py-4 whitespace-nowrap flex items-center font-medium text-left">
                  <TokenLogo
                    name={token.name}
                    address={token.address}
                    src={token.logo}
                    size="sm"
                    className="mr-2"
                  />
                  {token.name}
                  <div
                    className={`text-0.75 px-1 py-0.5 rounded-md ml-1 font-medium text-black ${
                      getChainNameAndColor(token.chainId)[1]
                    }`}
                  >
                    {getChainNameAndColor(token.chainId)[0]}
                  </div>
                </td>
                <td className="text-right px-6 py-4 whitespace-nowrap font-medium">
                  {token.balance}
                </td>
                <td className="text-right px-6 py-4 whitespace-nowrap font-medium">
                  {convertToGlobalFormatted(token.price)}
                </td>
                <td className="text-right px-6 py-4 whitespace-nowrap font-medium">
                  {convertToGlobalFormatted(token.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokensPage;
