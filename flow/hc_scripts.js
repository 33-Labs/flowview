import * as fcl from "@onflow/fcl"

export const getOwnedAccountInfo = async (address) => {
  const code = await (await fetch("/scripts/hc/get_owned_account_info.cdc")).text()

  const result = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  })

  return result
}
