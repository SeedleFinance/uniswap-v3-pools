import React from 'react';

import Web3CombinedProvider from './Web3CombinedProvider';
import SubgraphProvider from './SubgraphProvider';
import { AddressProvider } from './AddressProvider';
import { AppSettingsProvider } from './AppSettingsProvider';
import Container from './Container';

function App() {
  return (
    <Web3CombinedProvider>
      <SubgraphProvider>
        <AddressProvider>
          <AppSettingsProvider>
            <Container />
          </AppSettingsProvider>
        </AddressProvider>
      </SubgraphProvider>
    </Web3CombinedProvider>
  );
}

export default App;
