import { config } from "@onflow/fcl"
import publicConfig from "../publicConfig"
import { send as httpSend } from "@onflow/transport-http"

console.log(publicConfig.chainEnv)

if (publicConfig.chainEnv == "emulator") {
  config({
    "flow.network": "local",
    "accessNode.api": "http://localhost:8888",
    "discovery.wallet": "http://localhost:8701/fcl/authn",
    "sdk.transport": httpSend,
    "app.detail.title": "flowview",
    "app.detail.icon": "https://i.imgur.com/YL8MLEd.png",

    "0xFlowToken": "0xf8d6e0586b0a20c7",
    "0xNFTCatalog": "0xf8d6e0586b0a20c7",
    "0xMetadataViews": "0xf8d6e0586b0a20c7",
    "0xNonFungibleToken": "0xf8d6e0586b0a20c7",
    "0xFungibleToken": "0xee82856bf20e2aa6",
    "0xFungibleTokenSwitchboard": "0xee82856bf20e2aa6"
  })
} else if (publicConfig.chainEnv == "testnet") {
  config({
    "flow.network": "testnet",
    "accessNode.api": "https://side-still-sanctuary.flow-testnet.quiknode.pro",
    "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
    "sdk.transport": httpSend,
    "app.detail.title": "flowview",
    "app.detail.icon": "https://i.imgur.com/YL8MLEd.png",
  
    "0xFlowToken": "0x7e60df042a9c0868",
    "0xNFTCatalog": "0x324c34e1c517e4db",
    "0xMetadataViews": "0x631e88ae7f1d7c20",
    "0xNonFungibleToken": "0x631e88ae7f1d7c20",
    "0xFungibleToken": "0x9a0766d93b6608b7",
    "0xFungibleTokenSwitchboard": "0x9a0766d93b6608b7",
    "0xFlowbox": "0xbca26f5091cd39ec",
    "0xFlowviewAccountBookmark": "0xdc34f5a7b807bcfb",
    "0xNFTStorefrontV2": "0x2d55b98eb200daef",
  
    "0xHybridCustody": "0x294e44e1ec6993c6",
    "0xCapabilityFactory": "0x294e44e1ec6993c6",
    "0xCapabilityFilter": "0x294e44e1ec6993c6",
    "0xCapabilityDelegator": "0x294e44e1ec6993c6",
    "0xFindViews": "0x35717efbbce11c74",
    "0xFlowmap": "0x72ed11a540a52efc"
  })
} else {
  config({
    "flow.network": "mainnet",
    "accessNode.api": "https://floral-special-valley.flow-mainnet.quiknode.pro",
    "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
    "sdk.transport": httpSend,
    "app.detail.title": "flowview",
    "app.detail.icon": "https://i.imgur.com/YL8MLEd.png",
  
    "0xFlowToken": "0x1654653399040a61",
    "0xNFTCatalog": "0x49a7cda3a1eecc29",
    "0xMetadataViews": "0x1d7e57aa55817448",
    "0xNonFungibleToken": "0x1d7e57aa55817448",
    "0xFungibleToken": "0xf233dcee88fe0abe",
    "0xFungibleTokenSwitchboard": "0xf233dcee88fe0abe",
    "0xFlowbox": "0x1b3930856571a52b",
    "0xFlowviewAccountBookmark": "0x39b144ab4d348e2b",
    "0xNFTStorefrontV2": "0x4eb8a10cb9f87357",
  
    "0xHybridCustody": "0xd8a7e05a7ac670c0",
    "0xCapabilityFactory": "0xd8a7e05a7ac670c0",
    "0xCapabilityFilter": "0xd8a7e05a7ac670c0",
    "0xCapabilityDelegator": "0xd8a7e05a7ac670c0",
    "0xFindViews": "0x097bafa4e0b48eef",
    "0xFlowmap": "0x483f0fe77f0d59fb"
  })
}