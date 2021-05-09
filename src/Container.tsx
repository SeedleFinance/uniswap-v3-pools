import React, { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { BigNumber } from "@ethersproject/bignumber";

import { useV3NFTPositionManagerContract } from "./hooks/useContract";

import Position, { PositionProps } from "./Position";

const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42],
});

function Container() {
  const { activate, active, account } = useWeb3React();
  const contract = useV3NFTPositionManagerContract();

  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0));
  const [totalSupply, setTotalSupply] = useState<BigNumber>(BigNumber.from(0));
  const [positions, setPositions] = useState<PositionProps[]>([]);

  useEffect(() => {
    activate(injected, (err) => console.error(err));
  }, [activate]);

  useEffect(() => {
    const getBalance = async () => {
      if (active && account && contract) {
        const b = await contract.functions.balanceOf(account);
        setBalance(b[0]);
      }
    };
    const getTotalSupply = async () => {
      if (active && contract) {
        const b = await contract.functions.totalSupply();
        setTotalSupply(b[0]);
      }
    };

    getTotalSupply();
    getBalance();
  }, [active, account, contract]);

  useEffect(() => {
    const collectPositions = async (
      account: string,
      balance: number
    ): Promise<PositionProps[]> => {
      const results: PositionProps[] = [];

      const _collect = async (idx: number): Promise<PositionProps[]> => {
        if (contract && idx !== -1) {
          const tokIdResult = await contract.functions.tokenOfOwnerByIndex(
            account,
            idx
          );
          const result = await contract.functions.positions(tokIdResult[0]);
          const position = {
            id: tokIdResult[0],
            token0address: result[2],
            token1address: result[3],
            fee: result[4],
            tickLower: result[5],
            tickUpper: result[6],
            liquidity: result[7],
            feeGrowthInside0LastX128: result[8],
            feeGrowthInside1LastX128: result[9],
            tokensOwed0: result[10],
            tokensOwed1: result[11],
          };
          results.push(position);
          return _collect(idx - 1);
        } else {
          return results;
        }
      };

      return _collect(balance - 1);
    };

    const _run = async () => {
      if (!account || balance.isZero()) {
        return;
      }
      const results = await collectPositions(account, balance.toNumber());
      setPositions(results);
    };
    _run();
  }, [account, contract, balance]);

  const positionsList = positions.map((position) => (
    <>
      <Position {...position} />
    </>
  ));
  if (active) {
    return (
      <div>
        Connected to wallet <span>Account: {account}</span>
        <div>Total Positions: {totalSupply.toString()}</div>
        <div>You have {balance.toString()} positions</div>
        <div>Positions</div>
        {positionsList}
      </div>
    );
  }

  return <div>Connect to a wallet</div>;
}

export default Container;
