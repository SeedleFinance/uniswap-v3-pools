import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTokens } from '../../hooks/useTokens';
import BackArrow from '../../icons/LeftArrow';
import LoadingSpinner from '../../ui/Spinner';

const TokensPage = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useTokens();

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

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-low">
        Unable to load tokens.
      </div>
    );
  }

  if (!data) {
    return <div>You do not have any tokens.</div>;
  }

  console.log('data: ', data);

  return (
    <div>
      <button
        className="text-0.875 font-medium text-medium flex items-center"
        onClick={handleClickBack}
      >
        <BackArrow />
        <span className="ml-2">Home</span>
      </button>
      <h1 className="text-2.5 font-bold tracking-tighter leading-tight mt-4 text-high">Tokens</h1>
      <table className="text-high w-full mt-4">
        <thead className="border-b border-element-10">
          <tr className="align-middle">
            <th className="md:px-6 py-4 whitespace-nowrap font-medium text-left">Token</th>
            <th className="text-right px-6 py-4 whitespace-nowrap font-medium">Balance</th>
            <th className="text-right px-6 py-4 whitespace-nowrap font-medium">Current Price</th>

            <th className="text-right px-2 md:px-6 py-4 whitespace-nowrap font-medium">
              <span className="flex items-center justify-end cursor-default whitespace-nowrap">
                Utilization
              </span>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody className="text-0.875">
          {data.map((token) => (
            <tr key={token.name} className="w-full hover:bg-surface-10 cursor-pointer">
              <td className="md:px-6 py-4 whitespace-nowrap flex items-center font-medium text-left">
                <img className="w-8 h-8 mr-2" alt={`${token.name} logo`} src={token.logo} />
                {token.name}
              </td>
              <td className="text-right px-6 py-4 whitespace-nowrap font-medium">
                {token.balance}
              </td>
              <td className="text-right px-6 py-4 whitespace-nowrap font-medium">$0.00</td>
              <td className="text-right px-2 md:px-6 py-4 whitespace-nowrap font-medium">-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TokensPage;
