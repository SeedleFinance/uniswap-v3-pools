import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import PoolsPage from "./pages/Pools";
import AddLiquidityPage from "./pages/AddLiquidity/index";

function PageBody() {
  // TODO: Add a Not found page
  return (
    <Router>
      <Switch>
        <Route path="/add/new">
          <AddLiquidityPage tab="new" />
        </Route>
        <Route path="/add/existing">
          <AddLiquidityPage tab="existing" />
        </Route>
        <Route path="/">
          <PoolsPage />
        </Route>
      </Switch>
    </Router>
  );
}

export default PageBody;
