import { config } from "@onflow/fcl"
import publicConfig from "../publicConfig"
import {send as httpSend} from "@onflow/transport-http"

config({
  "flow.network": publicConfig.chainEnv == "emulator" ? "local" : publicConfig.chainEnv,
  "accessNode.api": publicConfig.accessNodeAPI,
  "discovery.wallet": publicConfig.walletDiscovery,
  "sdk.transport": httpSend,
  "app.detail.title": "flowview",
  "app.detail.icon": "https://i.imgur.com/YL8MLEd.png",

  "0xFlowToken": publicConfig.flowTokenAddress,
  "0xNFTCatalog": publicConfig.nftCatalogAddress,
  "0xMetadataViews": publicConfig.metadataViewsAddress,
  "0xNonFungibleToken": publicConfig.nonFungibleTokenAddress,
  "0xFungibleToken": publicConfig.fungibleTokenAddress,
  "0xFungibleTokenSwitchboard": publicConfig.fungibleTokenSwitchboardAddress,
  "0xFlowbox": publicConfig.flowboxAddress,
  "0xFlowviewAccountBookmark": publicConfig.accountBookmarkAddress,
  "0xNFTStorefrontV2": publicConfig.nftStorefrontV2Address,
})