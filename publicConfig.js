const chainEnv = process.env.NEXT_PUBLIC_CHAIN_ENV
if (!chainEnv) throw "Missing NEXT_PUBLIC_CHAIN_ENV"

const appURL = process.env.NEXT_PUBLIC_APP_URL
if (!appURL) throw "Missing NEXT_PUBLIC_APP_URL"

const flowscanURL = process.env.NEXT_PUBLIC_FLOWSCAN_URL
if (!flowscanURL) throw "Missing NEXT_PUBLIC_FLOWSCAN_URL"

const nftCatalogURL = process.env.NEXT_PUBLIC_NFTCATALOG_URL
if (!nftCatalogURL) throw "Missing NEXT_PUBLIC_NFTCATALOG_URL"

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

const contractbrowserURL = process.env.NEXT_PUBLIC_CONTRACTBROWSER_URL
if (!contractbrowserURL) throw "Missing NEXT_PUBLIC_CONTRACTBROWSER_URL"

const publicConfig = {
  chainEnv,
  appURL,
  flowscanURL,
  nftCatalogURL,
  flownsURL,
  findURL,
  bayouURL,
  drizzleURL,
  incrementURL,
  linkURL,
  contractbrowserURL
}

export default publicConfig
