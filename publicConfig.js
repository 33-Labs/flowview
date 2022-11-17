const chainEnv = process.env.NEXT_PUBLIC_CHAIN_ENV
if (!chainEnv) throw "Missing NEXT_PUBLIC_CHAIN_ENV"

const accessNodeAPI = process.env.NEXT_PUBLIC_ACCESS_NODE_API
if (!accessNodeAPI) throw "Missing NEXT_PUBLIC_ACCESS_NODE_API"

const appURL = process.env.NEXT_PUBLIC_APP_URL
if (!appURL) throw "Missing NEXT_PUBLIC_APP_URL"

const walletDiscovery = process.env.NEXT_PUBLIC_WALLET_DISCOVERY
if (!walletDiscovery) throw "Missing NEXT_PUBLIC_WALLET_DISCOVERY"

const flowscanURL = process.env.NEXT_PUBLIC_FLOWSCAN_URL
if (!flowscanURL) throw "Missing NEXT_PUBLIC_FLOWSCAN_URL"

const nftCatalogAddress = process.env.NEXT_PUBLIC_NFTCATALOG_ADDRESS
if (!nftCatalogAddress) throw "Missing NEXT_PUBLIC_NFTCATALOG_ADDRESS"

const publicConfig = {
  chainEnv,
  accessNodeAPI,
  appURL,
  walletDiscovery,
  flowscanURL,
  nftCatalogAddress
}

export default publicConfig
