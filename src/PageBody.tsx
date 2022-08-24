import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

import { CombinedPoolsProvider } from './CombinedPoolsProvider';
import { CombinedTokensProvider } from './CombinedTokensProvider';
import LandingPage from './pages/Landing';
import PoolDetailsPage from './pages/PoolDetails';
import AddLiquidityPage from './pages/AddLiquidity/index';
import TokensPage from './pages/Tokens';
import HomePage from './pages/Home';
import PoolsPage from './pages/Pools';

import { ROUTES } from './constants';
import { useAddress } from './AddressProvider';

function PoolsAndTokensLayout() {
  return (
    <CombinedPoolsProvider>
      <CombinedTokensProvider>
        <Outlet />
      </CombinedTokensProvider>
    </CombinedPoolsProvider>
  );
}

// TODO: Add a Not found page
function PageBody() {
  const { addressReady } = useAddress();

  return (
    <>
      <Router>
        <Routes>
          <Route
            path={`${ROUTES.ADD}/:quoteTokenSymbol/:baseTokenSymbol/:fee`}
            element={<AddLiquidityPage tab="new" />}
          />
          <Route path={ROUTES.ADD_NEW} element={<AddLiquidityPage tab="new" />} />
          <Route path={ROUTES.ADD_EXISTING} element={<AddLiquidityPage tab="existing" />} />

          <Route element={<PoolsAndTokensLayout />}>
            <Route path={ROUTES.HOME} element={addressReady ? <HomePage /> : <LandingPage />} />
            <Route
              path={`${ROUTES.POOL_DETAILS}/:id`}
              element={addressReady ? <PoolDetailsPage /> : <LandingPage />}
            />
            <Route path={ROUTES.POOLS} element={addressReady ? <PoolsPage /> : <LandingPage />} />
            <Route path={ROUTES.TOKENS} element={<TokensPage />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default PageBody;
