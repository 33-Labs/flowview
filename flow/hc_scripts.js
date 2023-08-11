import * as fcl from "@onflow/fcl"

export const getParentAddresses = async (address) => {
  const code = await (await fetch("/scripts/linked_accounts/get_parent_addresses.cdc")).text()

  const result = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  })

  return result
}
