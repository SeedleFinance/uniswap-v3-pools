import React from 'react';
import { Link } from 'react-router-dom';

import { useTokens } from '../../CombinedTokensProvider';
import { getChainNameAndColor } from '../../utils/chains';
import { useCurrencyConversions } from '../../CurrencyConversionsProvider';

import BackArrow from '../../icons/LeftArrow';
import LoadingSpinner from '../../ui/Spinner';
import TokenLogo from '../../ui/TokenLogo';
import { ROUTES } from '../../constants';

const TokensPage = () => {
  const { convertToGlobalFormatted } = useCurrencyConversions();
  const { loading, tokens } = useTokens();

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
      <Link to={ROUTES.HOME} className="text-0.875 font-medium text-medium flex items-center">
        <BackArrow />
        <span className="ml-2">Home</span>
      </Link>
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
            {tokens.map((token) => (
              <tr key={token.name} className="w-full hover:bg-surface-10 cursor-pointer">
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
