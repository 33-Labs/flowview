import * as fcl from "@onflow/fcl"

export const getListings = async (address) => {
  const code = await (await fetch("/scripts/storefront/get_listings.cdc")).text()

  const result = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  })

  return result
}

export const getExistingListings = async (address, contractName, contractAddress, tokenId) => {
  let code = await (await fetch("/scripts/storefront/get_existing_listings.cdc")).text()
  code = code
    .replaceAll("__NFT_CONTRACT_NAME__", contractName)
    .replaceAll("__NFT_CONTRACT_ADDRESS__", contractAddress)

  const result = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(tokenId, t.UInt64)
    ]
  })

  return result
}
