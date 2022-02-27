import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PoolsPage from "./pages/Pools";
import AddLiquidityPage from "./pages/AddLiquidity/index";

function PageBody() {
  // TODO: Add a Not found page
  return (
    <Router>
      <Routes>
        <Route path="/add/new" element={<AddLiquidityPage tab="new" />} />
        <Route
          path="/add/existing"
          element={<AddLiquidityPage tab="existing" />}
        />
        <Route
          path="/add/:quoteTokenSymbol/:baseTokenSymbol/:fee"
          element={<AddLiquidityPage tab="new" />}
        />
        <Route path="/" element={<PoolsPage />} />
      </Routes>
    </Router>
  );
}

export default PageBody;
