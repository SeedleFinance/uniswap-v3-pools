import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useTokens } from '../../CombinedTokensProvider';
import { getChainNameAndColor } from '../../utils/chains';
import { useCurrencyConversions } from '../../CurrencyConversionsProvider';
import { ChainID } from '../../enums';

import BackArrow from '../../icons/LeftArrow';
import LoadingSpinner from '../../ui/Spinner';
import TokenLogo from '../../ui/TokenLogo';
import Card from '../../ui/Card';

const TokensPage = () => {
  const navigate = useNavigate();
  const { convertToGlobalFormatted, formatCurrencyWithSymbol } = useCurrencyConversions();
  const { loading, tokens, totalTokenValue } = useTokens();

  function handleClickBack() {
    navigate(-1);
  }

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
      <button
        className="text-0.875 font-medium text-medium flex items-center"
        onClick={handleClickBack}
      >
        <BackArrow />
        <span className="ml-2">Home</span>
      </button>

      <div className="flex flex-col-reverse md:flex-row md:justify-between items-center">
        <div className="hidden md:flex w-4/5 flex-col text-high">
          <h1 className="text-2.5 font-bold tracking-tighter leading-tight">Tokens</h1>
        </div>
        <div className="flex w-1/5 overflow-x-auto md:overflow-x-visible py-2">
          <Card className="ml-1 md:ml-2">
            <div className="text-1.25 md:text-1.75 my-1 font-semibold">
              {formatCurrencyWithSymbol(totalTokenValue, ChainID.Mainnet)}
            </div>
            <div className="text-0.875 md:text-1 text-brand-dark-primary">Total Value</div>
          </Card>
        </div>
      </div>

      <table className="text-high w-full mt-4">
        <thead className="border-b border-element-10">
          <tr className="align-middle">
            <th className="md:px-6 py-4 whitespace-nowrap font-medium text-left">Token</th>
            <th className="text-right px-6 py-4 whitespace-nowrap font-medium">Balance</th>
            <th className="text-right px-6 py-4 whitespace-nowrap font-medium">Current Price</th>
            <th className="text-right px-6 py-4 whitespace-nowrap font-medium">Value</th>
          </tr>
        </thead>
        <tbody className="text-0.875">
          {tokens.map((token) => (
            <tr key={token.name} className="w-full hover:bg-surface-10 cursor-pointer">
              <td className="md:px-6 py-4 whitespace-nowrap flex items-center font-medium text-left">
                <TokenLogo
                  className="w-8 h-8 mr-2"
                  name={token.name}
                  address={token.address}
                  src={token.logo}
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
  );
};

export default TokensPage;
