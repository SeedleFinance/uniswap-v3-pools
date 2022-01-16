import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { CombinedPoolsProvider } from "./CombinedPoolsProvider";
import { CurrencyConversionsProvider } from "./CurrencyConversionsProvider";
import PoolsPage from "./pages/Pools";
import AddLiquidityPage from "./pages/AddLiquidity/index";

function PageBody() {
  // TODO: Add a Not found page
  return (
    <Router>
      <Switch>
        <Route path="/add/new">
          <CurrencyConversionsProvider>
            <AddLiquidityPage tab="new" />
          </CurrencyConversionsProvider>
        </Route>
        <Route path="/add/existing">
          <CurrencyConversionsProvider>
            <AddLiquidityPage tab="existing" />
          </CurrencyConversionsProvider>
        </Route>
        <Route path="/add/:quoteTokenSymbol/:baseTokenSymbol/:fee">
          <CurrencyConversionsProvider>
            <AddLiquidityPage tab="new" />
          </CurrencyConversionsProvider>
        </Route>

        <Route path="/">
          <CombinedPoolsProvider>
            <CurrencyConversionsProvider>
              <PoolsPage />
            </CurrencyConversionsProvider>
          </CombinedPoolsProvider>
        </Route>
      </Switch>
    </Router>
  );
}

export default PageBody;
