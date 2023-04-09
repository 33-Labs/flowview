import FlowIDTableStaking from 0x8624b52f9ddcd04a

pub fun main(nodeID: String, delegatorID: UInt32): FlowIDTableStaking.DelegatorInfo {
  return FlowIDTableStaking.DelegatorInfo(nodeID: nodeID, delegatorID: delegatorID)
}