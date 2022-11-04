import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { LABELS, ROUTES } from '../../../common/constants';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Helper from '../../../components/icons/Helper';
import BackArrow from '../../../components/icons/LeftArrow';
import Tooltip from '../../../components/Tooltip';
import useToken from '../../../hooks/useToken';

const TokenPage = () => {
  const router = useRouter();
  const { data, isError, isLoading } = useToken(router.query.token as string);

  function handleClickAddToPool() {}

  function handleClickSwapTokens() {}

  if (isError || !data) {
    return (
      <div className="w-full h-full flex justify-center items-center text-medium">
        Unable to fetch token.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center text-medium">Loading..</div>
    );
  }

  const transactionsRender = () => {
    if (!data.transactions.length) {
      return (
        <div className="flex items-start justify-center py-20 text-low">
          No transaction history.
        </div>
      );
    }

    // todo: render transactions
    <div>transactions to go here.</div>;
  };

  // Token Balances
  const totalBalance = Object.values(data.balancePerNetwork).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-between w-full">
        <div className="flex gap-20">
          <div className="flex flex-col">
            <Link href={`${ROUTES.HOME}${location.search}`}>
              <a className="text-0.875 font-medium text-medium flex items-center">
                <BackArrow />
                <span className="ml-2">Home</span>
              </a>
            </Link>
            <div className="flex items-center gap-2">
              <h2 className=" font-bold text-2 text-high">{data.name}</h2>
              <span className="bg-slate-200 rounded-md px-1 font-medium text-0.8125">
                {data.symbol}
              </span>
            </div>
          </div>
          <div className="flex flex-col text-low text-0.6875 gap-2">
            <div>
              {data.name} price ({data.symbol}
            </div>
            <div className="font-bold text-high text-2">${data.price.toFixed(4)}</div>
            <div className="flex gap-2">
              {Object.keys(data.balancePerNetwork).map((network) => (
                <div
                  key={network}
                  className="text-high bg-slate-200 font-medium px-2 py-1 rounded-md"
                >
                  {network}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <Card>
            <div className="text-bold text-high text-2 font-bold tracking-tight">
              {data.balancePerNetwork.mainnet} {data.symbol}
            </div>
            <div className="text-low">Balance: {data.price * totalBalance}</div>
          </Card>
        </div>
      </div>

      <div className="flex justify-between mt-20">
        <div className="text-0.75 text-low">Price updated 1 minute ago</div>
        <div className="flex gap-4 items-center">
          <Button variant="outline" size="lg" onClick={handleClickSwapTokens}>
            Swap Tokens
          </Button>
          <Button size="lg" onClick={handleClickAddToPool}>
            Add to Pool
          </Button>
        </div>
      </div>

      <div className="flex gap-8 mt-4">
        <Card className="px-8 basis-1/3">
          <div>
            <div className="flex justify-between items center flex-1 text-low border-b border-element-10 py-4">
              <div className="text-0.875">Market Cap</div>
              <div className="text-high">{data.marketCap}</div>
            </div>
            <div className="flex justify-between items center flex-1 text-low border-b border-element-10 py-4">
              <div className="text-0.875">Circulating Supply</div>
              <div className="text-high">{data.supply}</div>
            </div>
            <div className="flex justify-between items center flex-1 text-low border-b border-element-10 py-4">
              <div className="text-0.875">Swap Volume</div>
              <div className="text-high">{data.swapVol}</div>
            </div>
            <div className="flex justify-between items center flex-1 text-low border-b border-element-10 py-4">
              <div className="text-0.875">Swap Volume</div>
              <div className="text-high">{data.swapVol}</div>
            </div>
            <div className="flex justify-between items center flex-1 text-low border-b border-element-10 py-4">
              <div className="text-0.875">All Time High</div>
              <div className="text-high">{data.allHigh}</div>
            </div>
            <div className="flex justify-between items center flex-1 text-low border-b border-element-10 py-4">
              <div className="text-0.875">All Time Low</div>
              <div className="text-high">{data.allLow}</div>
            </div>
            <div className="flex py-3 text-0.75 text-medium">
              Have this data is collected?
              <Tooltip label={LABELS.DATA_COLLECTED} placement="top-end">
                <span className="flex items-center justify-end">
                  <Helper className="ml-1" />
                </span>
              </Tooltip>
            </div>
          </div>
        </Card>
        <Card className="px-8 basis-2/3 flex items-center justify-center">Graph</Card>
      </div>
      {transactionsRender()}
    </div>
  );
};

export default TokenPage;
