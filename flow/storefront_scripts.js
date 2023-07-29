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
