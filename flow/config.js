import fcl, { config } from "@onflow/fcl"
import { send as httpSend } from "@onflow/transport-http"

export const Network = {
  Mainnet: {
    name: "mainnet",
    config: {
      "flow.network": "mainnet",
      "accessNode.api": "https://rest-mainnet.onflow.org",
      "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
      "sdk.transport": httpSend,
      "app.detail.title": "flowview",
      "app.detail.icon": "https://i.imgur.com/YL8MLEd.png",

      "0xNFTCatalog": "0x49a7cda3a1eecc29",
      "0xMetadataViews": "0x1d7e57aa55817448",
      "0xNonFungibleToken": "0x1d7e57aa55817448",
      "0xFungibleToken": "0xf233dcee88fe0abe",
      "0xFlowbox": "0x1b3930856571a52b",

      "flowscanUrl": "https://flowscan.org",
      "nftCatalogUrl": "https://www.flow-nft-catalog.com/catalog/mainnet",
      "flownsUrl": "https://www.flowns.org/domain",
      "findUrl": "https://find.xyz",
      "bayouUrl": "https://flow.bayou33.app",
      "drizzleUrl": "https://www.drizzle33.app",
      "incrementUrl": "https://increment.fi",
      "linkUrl": "https://link.ecdao.org",
    }
  },
  Testnet: {
    name: "testnet",
    config: {
      "flow.network": "testnet",
      "accessNode.api": "https://rest-testnet.onflow.org",
      "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
      "sdk.transport": httpSend,
      "app.detail.title": "flowview",
      "app.detail.icon": "https://i.imgur.com/YL8MLEd.png",

      "0xNFTCatalog": "0x324c34e1c517e4db",
      "0xMetadataViews": "0x631e88ae7f1d7c20",
      "0xNonFungibleToken": "0x631e88ae7f1d7c20",
      "0xFungibleToken": "0x9a0766d93b6608b7",
      "0xFlowbox": "0xbca26f5091cd39ec",

      "flowscanUrl": "https://testnet.flowscan.org",
      "nftCatalogUrl": "https://www.flow-nft-catalog.com/catalog/testnet",
      "flownsUrl": "https://testnet.flowns.org/domain",
      "findUrl": "https://test-find.xyz",
      "bayouUrl": "https://flow.bayou33.app",
      "drizzleUrl": "https://www.drizzle33.app",
      "incrementUrl": "https://increment.fi",
      "linkUrl": "https://link.ecdao.org",
    },
  },
  Emulator: {
    name: "emulator",
    config: {
      "flow.network": "local",
      "accessNode.api": "http://localhost:8888",
      "discovery.wallet": "http://localhost:8701/fcl/authn",
      "sdk.transport": httpSend,
      "app.detail.title": "flowview",
      "app.detail.icon": "https://i.imgur.com/YL8MLEd.png",

      "0xNFTCatalog": "0x324c34e1c517e4db",
      "0xMetadataViews": "0xf8d6e0586b0a20c7",
      "0xNonFungibleToken": "0xf8d6e0586b0a20c7",
      "0xFungibleToken": "0xee82856bf20e2aa6",
      "0xFlowbox": "0xbca26f5091cd39ec",

      "flowscanUrl": "https://testnet.flowscan.org",
      "nftCatalogUrl": "https://www.flow-nft-catalog.com/catalog/testnet",
      "flownsUrl": "https://testnet.flowns.org/domain",
      "findUrl": "https://test-find.xyz",
      "bayouUrl": "https://flow.bayou33.app",
      "drizzleUrl": "https://www.drizzle33.app",
      "incrementUrl": "https://increment.fi",
      "linkUrl": "https://link.ecdao.org",
    },
  }
}

config(Network.Mainnet.config)

export async function getNetwork() {
  return await config().get("flow.network")
}

export async function getUrls() {
  const flowscan = await config().get("flowscanUrl", '')
  const nftCatalog = await config().get("nftCatalogUrl", '')
  const flowns = await config().get("flownsUrl", '')
  const find = await config().get("findUrl", '')
  const bayou = await config().get("bayouUrl", '')
  const drizzle = await config().get("drizzleUrl", '')
  const increment = await config().get("incrementUrl", '')
  const link = await config().get("linkUrl", '')
  return {
    flowscan: flowscan,
    nftCatalog: nftCatalog,
    flowns: flowns,
    find: find,
    bayou: bayou,
    drizzle: drizzle,
    increment: increment,
    link: link
  }
}

export const NetworkNames = [Network.Mainnet.name, Network.Testnet.name, Network.Emulator.name]

export const configureForNetwork = (network) => {
  if (network === "mainnet") {
    config(Network.Mainnet.config);
  } else if (network === "testnet") {
    config(Network.Testnet.config);
  } else if (network === "emulator") {
    config(Network.Emulator.config);
  }
}
