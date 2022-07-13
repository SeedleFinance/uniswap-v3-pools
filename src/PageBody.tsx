import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import PoolsPage from './pages/Pools';
import PoolDetailsPage from './pages/PoolDetails';

import AddLiquidityPage from './pages/AddLiquidity/index';

import { ROUTES } from './constants';

function PageBody() {
  // TODO: Add a Not found page
  return (
    <Router>
      <Routes>
        <Route
          path={`${ROUTES.ADD}/:quoteTokenSymbol/:baseTokenSymbol/:fee`}
          element={<AddLiquidityPage tab="new" />}
        />
        <Route path={ROUTES.ADD_NEW} element={<AddLiquidityPage tab="new" />} />
        <Route path={ROUTES.ADD_EXISTING} element={<AddLiquidityPage tab="existing" />} />
        <Route path={ROUTES.HOME} element={<PoolsPage />} />
        <Route path={`${ROUTES.POOL_DETAILS}/:id`} element={<PoolDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default PageBody;
