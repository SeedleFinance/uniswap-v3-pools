import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { isAddress } from '@ethersproject/address';

const useENS = (address: string | null | undefined) => {
  const { library } = useWeb3React('mainnet');
  const [ensName, setENSName] = useState<string | null>();

  useEffect(() => {
    const resolveENS = async () => {
      if (library && address && isAddress(address)) {
        const ensName = await library.lookupAddress(address);
        setENSName(ensName);
      }
    };
    resolveENS();
  }, [address, library]);

  return { ensName };
};

export default useENS;
