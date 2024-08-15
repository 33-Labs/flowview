import FlowIDTableStaking from 0x8624b52f9ddcd04a

access(all) fun main(nodeID: String): FlowIDTableStaking.NodeInfo {
  return FlowIDTableStaking.NodeInfo(nodeID: nodeID)
}