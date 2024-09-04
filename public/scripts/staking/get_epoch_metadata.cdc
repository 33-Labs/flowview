import FlowEpoch from 0x8624b52f9ddcd04a

access(all) fun main(epochCounter: UInt64): FlowEpoch.EpochMetadata? {
  return FlowEpoch.getEpochMetadata(epochCounter)
}