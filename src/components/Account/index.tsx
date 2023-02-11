import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import Button from '../Button';

const Account = () => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!mounted || !account || !chain) {
                return (
                  <Button variant="primary" onClick={openConnectModal} type="button" size="lg">
                    Connect Wallet
                  </Button>
                );
              }
              if (chain.unsupported) {
                return (
                  <Button variant="secondary" onClick={openChainModal} type="button" size="lg">
                    Wrong network
                  </Button>
                );
              }
              return (
                <div className="flex gap-2">
                  <div className="hidden md:block">
                    <Button variant="outline" onClick={openChainModal} type="button" size="lg">
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 12,
                            height: 12,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 12, height: 12 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </Button>
                  </div>
                  <Button onClick={openAccountModal} variant="outline" type="button" size="lg">
                    <span className="ml-1">{account.displayName}</span>
                    <span className="hidden md:block">
                      {account.displayBalance ? ` (${account.displayBalance})` : ''}
                    </span>
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default Account;
