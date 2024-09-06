import { config } from "@onflow/fcl"
import publicConfig from "../publicConfig"
import { send as httpSend } from "@onflow/transport-http"

async function main() {
  console.log(publicConfig.chainEnv);

  let cfg;
  if (publicConfig.chainEnv == "emulator") {
    cfg = config({
      "flow.network": "local",
      "accessNode.api": "http://localhost:8888",
      "sdk.transport": httpSend,
      "app.detail.title": "flowview",
      "app.detail.icon": "https://i.imgur.com/YL8MLEd.png",
      "walletconnect.projectId": "3148daad1116829ab01e9a271fe97179",
      "discovery.wallet": "http://localhost:8701/fcl/authn",
      "discovery.authn.endpoint": "http://localhost:8701/fcl/authn",

      "0xFlowToken": "0xf8d6e0586b0a20c7",
      "0xNFTCatalog": "0xf8d6e0586b0a20c7",
      "0xMetadataViews": "0xf8d6e0586b0a20c7",
      "0xViewResolver": "0xf8d6e0586b0a20c7",
      "0xNonFungibleToken": "0xf8d6e0586b0a20c7",
      "0xFungibleToken": "0xee82856bf20e2aa6",
      "0xFungibleTokenSwitchboard": "0xee82856bf20e2aa6",
    });
  } else if (publicConfig.chainEnv == "testnet") {
    cfg = config({
      "flow.network": "testnet",
      "accessNode.api":
        "https://side-still-sanctuary.flow-testnet.quiknode.pro",
      "sdk.transport": httpSend,
      "app.detail.title": "flowview",
      "app.detail.icon": "https://i.imgur.com/YL8MLEd.png",
      "walletconnect.projectId": "3148daad1116829ab01e9a271fe97179",
      "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
      "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/testnet/authn",

      "0xFlowToken": "0x7e60df042a9c0868",
      "0xNFTCatalog": "0x324c34e1c517e4db",
      "0xMetadataViews": "0x631e88ae7f1d7c20",
      "0xViewResolver": "0x631e88ae7f1d7c20",
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
      "0xFlowmap": "0x72ed11a540a52efc",
    });
  } else {
    // "https://floral-special-valley.flow-mainnet.quiknode.pro",
    cfg = config({
      "flow.network": "mainnet",
      "accessNode.api": "https://rest-mainnet.onflow.org",
      "sdk.transport": httpSend,
      "app.detail.title": "flowview",
      "app.detail.icon": "https://i.imgur.com/YL8MLEd.png",
      "walletconnect.projectId": "3148daad1116829ab01e9a271fe97179",
      "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
      "discovery.authn.endpoint": "https://fcl-discovery.onflow.org/api/authn",

      "0xFlowToken": "0x1654653399040a61",
      "0xNFTCatalog": "0x49a7cda3a1eecc29",
      "0xMetadataViews": "0x1d7e57aa55817448",
      "0xViewResolver": "0x1d7e57aa55817448",
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
      "0xFlowmap": "0x483f0fe77f0d59fb",
    });
  }

  const resp = await fetch(process.env.NEXT_PUBLIC_APP_URL + "/flow.json");
  const flowJson = await resp.json()
  await cfg.load({ flowJSON: flowJson ?? {} });
}
main();
