import { ApolloClient, InMemoryCache } from "@apollo/client";

export const mainnetClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  cache: new InMemoryCache(),
  queryDeduplication: false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

export const ropstenClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-ropsten",
  cache: new InMemoryCache(),
  queryDeduplication: false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

export const arbitrumClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/laktek/uniswap-v3-arbitrum",
  cache: new InMemoryCache(),
  queryDeduplication: false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

export const optimismClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/laktek/uniswap-v3-optimism",
  cache: new InMemoryCache(),
  queryDeduplication: false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

export const polygonClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon",
  cache: new InMemoryCache(),
  queryDeduplication: false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

export const perpOptimClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/perpetual-protocol/perpetual-v2-optimism",
  cache: new InMemoryCache(),
  queryDeduplication: false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

export function getClient(chainId: number) {
  const clients: { [key: number]: any } = {
    1: mainnetClient,
    10: optimismClient,
    42161: arbitrumClient,
    137: polygonClient,
  };

  return clients[chainId] || mainnetClient;
}

export function getPerpClient(chainId: number) {
  const clients: { [key: number]: any } = {
    10: perpOptimClient,
  };

  return clients[chainId] || perpOptimClient;
}

export const healthClient = new ApolloClient({
  uri: "https://api.thegraph.com/index-node/graphql",
  cache: new InMemoryCache(),
});

export const blockClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks",
  cache: new InMemoryCache(),
});
