import * as fcl from "@onflow/fcl"

export const getEpochMetadata = async (epochCounter) => {
  const code = await (await fetch("/scripts/staking/get_epoch_metadata.cdc")).text()

  const result = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(epochCounter, t.UInt64)
    ]
  })

  return result
}

export const getStakingInfo = async (address) => {
  const code = await (await fetch("/scripts/staking/get_staking_info.cdc")).text()

  const result = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  })

  return result
}

export const getNodeInfo = async (nodeID) => {
  const code = await (await fetch("/scripts/staking/get_node_info.cdc")).text()

  const result = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(nodeID, t.String)
    ]
  })

  return result
}

export const getDelegatorInfo = async (nodeID, delegatorID) => {
  const code = await (await fetch("/scripts/staking/get_delegator_info.cdc")).text()

  const result = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(nodeID, t.String),
      arg(delegatorID, t.UInt32)
    ]
  })

  return result
}