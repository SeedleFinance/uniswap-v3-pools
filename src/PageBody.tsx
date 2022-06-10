import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import PoolsPage from './pages/Pools';
import AddLiquidityPage from './pages/AddLiquidity/index';
import { ROUTES } from './constants';

function PageBody() {
  // TODO: Add a Not found page
  return (
    <Router>
      <Routes>
        <Route
          path="/add/:quoteTokenSymbol/:baseTokenSymbol/:fee"
          element={<AddLiquidityPage tab="new" />}
        />
        <Route path="/add/new" element={<AddLiquidityPage tab="new" />} />
        <Route path="/add/existing" element={<AddLiquidityPage tab="existing" />} />
        <Route path={ROUTES.HOME} element={<PoolsPage />} />
      </Routes>
    </Router>
  );
}

export default PageBody;
