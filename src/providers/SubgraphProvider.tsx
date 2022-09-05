import React, { ReactNode } from "react";
import { ApolloProvider } from "@apollo/client/react";

import { mainnetClient } from "../lib/apollo";

interface Props {
  children: ReactNode;
}

function Provider({ children }: Props) {
  return <ApolloProvider client={mainnetClient}>{children}</ApolloProvider>;
}

export default Provider;
