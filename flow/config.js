import { config } from "@onflow/fcl"
import publicConfig from "../publicConfig"
import {send as httpSend} from "@onflow/transport-http"

config({
  "flow.network": "local",
  "accessNode.api": "http://localhost:8888",
  "discovery.wallet": "http://localhost:8701/fcl/authn",
  "discovery.authn.endpoint": "http://localhost:3002/api/local/authn",
  "app.detail.title": "flowview",
  "app.detail.icon": "https://i.imgur.com/YL8MLEd.png",

  "0xNFTCatalog": publicConfig.nftCatalogAddress,
  "0xMetadataViews": publicConfig.metadataViewsAddress,
  "0xNonFungibleToken": publicConfig.nonFungibleTokenAddress,
  "0xFungibleToken": publicConfig.fungibleTokenAddress,
  "0xFlowbox": publicConfig.flowboxAddress
})