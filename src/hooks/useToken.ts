import { useState, useEffect } from 'react';
import { tokenData } from '../fakeTokenData';

export interface TokenData {
  name: string;
  symbol: string;
  balancePerNetwork: {
    mainnet: number;
    arbritrum: number;
    polygon: number;
  };
  price: number;
  marketCap: number;
  supply: number; // circulating supply
  swapVol: number; // swap volume
  allHigh: number; // all time high
  allLow: number; // all time low
  historical: []; // historical prices to show in the graph
  transactions: []; // transaction history
}

const useToken = (tokenAddress: string) => {
  const [data, setData] = useState<{ data?: TokenData; isLoading: boolean; isError: boolean }>();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        // fake
        const fetched = tokenData[tokenAddress];

        setData((prev) => ({
          ...prev,
          data: fetched,
          isLoading: false,
          isError: false,
        }));
      } catch (error) {
        console.log(error);
        setData({
          data: undefined,
          isLoading: false,
          isError: true,
        });
      }
    };
    fetchToken();
  }, [tokenAddress]);

  if (!data) {
    return { data: undefined, isLoading: false, isError: true };
  }

  return { data: data.data, isLoading: data.isLoading, isError: data.isError };
};

export default useToken;
