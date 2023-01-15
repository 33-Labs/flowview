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

const nftCatalogURL = process.env.NEXT_PUBLIC_NFTCATALOG_URL
if (!nftCatalogURL) throw "Missing NEXT_PUBLIC_NFTCATALOG_URL"

const nftCatalogAddress = process.env.NEXT_PUBLIC_NFTCATALOG_ADDRESS
if (!nftCatalogAddress) throw "Missing NEXT_PUBLIC_NFTCATALOG_ADDRESS"

const metadataViewsAddress = process.env.NEXT_PUBLIC_METADATAVIEWS_ADDRESS
if (!metadataViewsAddress) throw "Missing NEXT_PUBLIC_METADATAVIEWS_ADDRESS"

const nonFungibleTokenAddress = process.env.NEXT_PUBLIC_NONFUNGIBLE_TOKEN_ADDRESS
if (!nonFungibleTokenAddress) throw "Missing NEXT_PUBLIC_NONFUNGIBLE_TOKEN_ADDRESS"

const fungibleTokenAddress = process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS
if (!fungibleTokenAddress) throw "Missing NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS"

const fungibleTokenSwitchboardAddress = process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_SWITCHBOARD_ADDRESS
if (!fungibleTokenSwitchboardAddress) throw "Missing NEXT_PUBLIC_FUNGIBLE_TOKEN_SWITCHBOARD_ADDRESS"

const flowboxAddress = process.env.NEXT_PUBLIC_FLOWBOX_ADDRESS
if (!flowboxAddress) throw "Missing NEXT_PUBLIC_FLOWBOX_ADDRESS"

const flownsURL = process.env.NEXT_PUBLIC_FLOWNS_URL
if (!flownsURL) throw "Missing NEXT_PUBLIC_FLOWNS_URL"

const findURL = process.env.NEXT_PUBLIC_FIND_URL
if (!findURL) throw "Missing NEXT_PUBLIC_FIND_URL"

const bayouURL = process.env.NEXT_PUBLIC_BAYOU_URL
if (!bayouURL) throw "Missing NEXT_PUBLIC_BAYOU_URL"

const drizzleURL = process.env.NEXT_PUBLIC_DRIZZLE_URL
if (!drizzleURL) throw "Missing NEXT_PUBLIC_DRIZZLE_URL"

const incrementURL = process.env.NEXT_PUBLIC_INCREMENT_URL
if (!incrementURL) throw "Missing NEXT_PUBLIC_INCREMENT_URL"

const linkURL = process.env.NEXT_PUBLIC_LINK_URL
if (!linkURL) throw "Missing NEXT_PUBLIC_LINK_URL"

const publicConfig = {
  chainEnv,
  accessNodeAPI,
  appURL,
  walletDiscovery,
  flowscanURL,
  nftCatalogURL,
  nftCatalogAddress,
  metadataViewsAddress,
  nonFungibleTokenAddress,
  fungibleTokenAddress,
  fungibleTokenSwitchboardAddress,
  flowboxAddress,
  flownsURL,
  findURL,
  bayouURL,
  drizzleURL,
  incrementURL,
  linkURL
}

export default publicConfig
