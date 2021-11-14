import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  //uri: "https://api.thegraph.com/subgraphs/name/laktek/uniswap-v3-mainnet",
  uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  cache: new InMemoryCache(),
  queryDeduplication: false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },
});

//export const client = new ApolloClient({
//   uri: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-ropsten',
//   cache: new InMemoryCache(),
//   queryDeduplication: false,
//   defaultOptions: {
//     watchQuery: {
//       fetchPolicy: 'cache-and-network',
//     },
//   },
// })

export const healthClient = new ApolloClient({
  uri: "https://api.thegraph.com/index-node/graphql",
  cache: new InMemoryCache(),
});

export const blockClient = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks",
  cache: new InMemoryCache(),
});
