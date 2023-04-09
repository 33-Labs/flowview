import * as fcl from "@onflow/fcl"

export const getSwitchboard = async (address) => {
  const code = await (await fetch("/scripts/switchboard/get_switchboard.cdc")).text()

  const result = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  }) 

  return result
}