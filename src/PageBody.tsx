import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

import { CombinedPoolsProvider } from './CombinedPoolsProvider';
import PoolsPage from './pages/Pools';
import LandingPage from './pages/Landing';
import PoolDetailsPage from './pages/PoolDetails';
import AddLiquidityPage from './pages/AddLiquidity/index';

import { ROUTES } from './constants';
import { useAddress } from './AddressProvider';

function PoolsLayout() {
  return (
    <CombinedPoolsProvider>
      <Outlet />
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

          <Route element={<PoolsLayout />}>
            <Route path={ROUTES.HOME} element={addressReady ? <PoolsPage /> : <LandingPage />} />
            <Route
              path={`${ROUTES.POOL_DETAILS}/:id`}
              element={addressReady ? <PoolDetailsPage /> : <LandingPage />}
            />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default PageBody;
