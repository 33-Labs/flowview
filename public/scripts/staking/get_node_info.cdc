import FlowIDTableStaking from 0x8624b52f9ddcd04a

pub fun main(nodeID: String): FlowIDTableStaking.NodeInfo {
  return FlowIDTableStaking.NodeInfo(nodeID: nodeID)
}