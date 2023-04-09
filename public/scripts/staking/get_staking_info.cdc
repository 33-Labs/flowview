import LockedTokens from 0x8d0e87b65159ae63
import FlowIDTableStaking from 0x8624b52f9ddcd04a
import FlowEpoch from 0x8624b52f9ddcd04a

pub struct EpochInfo {
  pub let currentEpochCounter: UInt64
  pub let currentEpochPhase: UInt8

  init(
      currentEpochCounter: UInt64,
      currentEpochPhase: UInt8
  ) {
      self.currentEpochCounter = currentEpochCounter
      self.currentEpochPhase = currentEpochPhase
  }
}

pub struct Result {
  pub let stakingInfo: StakingInfo?

  init(stakingInfo: StakingInfo?) {
    self.stakingInfo = stakingInfo
  }
}

pub struct StakingInfo {
  pub let epochInfo: EpochInfo
  pub let lockedAddress: Address   
  pub let lockedBalance: UFix64
  pub let unlockLimit: UFix64
  pub let nodeInfo: NodeInfo?
  pub let delegatorNodeInfo: NodeInfo?
  pub let delegatorInfo: DelegatorInfo?

  init(
    epochInfo: EpochInfo,
    lockedAddress: Address,
    lockedBalance: UFix64,
    unlockLimit: UFix64,
    nodeInfo: NodeInfo?,
    delegatorNodeInfo: NodeInfo?,
    delegatorInfo: DelegatorInfo?,
  ) {
    self.epochInfo = epochInfo
    self.lockedAddress = lockedAddress
    self.lockedBalance = lockedBalance
    self.unlockLimit = unlockLimit
    self.nodeInfo = nodeInfo
    self.delegatorNodeInfo = delegatorNodeInfo
    self.delegatorInfo = delegatorInfo
  }
}

pub struct NodeInfo {
  pub let id: String
  pub let networkingAddress: String
  pub let role: UInt8
  pub let tokensStaked: UFix64
  pub let tokensCommitted: UFix64
  pub let tokensUnstaking: UFix64
  pub let tokensUnstaked: UFix64
  pub let tokensRewarded: UFix64
  
  pub let delegatorIDCounter: UInt32
  pub let tokensRequestedToUnstake: UFix64
  pub let initialWeight: UInt64

  init(nodeID: String) {
    let nodeInfo = FlowIDTableStaking.NodeInfo(nodeID: nodeID) 

    self.id = nodeInfo.id
    self.networkingAddress = nodeInfo.networkingAddress
    self.role = nodeInfo.role
    self.tokensStaked = nodeInfo.tokensStaked
    self.tokensCommitted = nodeInfo.tokensCommitted
    self.tokensUnstaking = nodeInfo.tokensUnstaking
    self.tokensUnstaked = nodeInfo.tokensUnstaked
    self.tokensRewarded = nodeInfo.tokensRewarded
    self.delegatorIDCounter = nodeInfo.delegatorIDCounter
    self.tokensRequestedToUnstake = nodeInfo.tokensRequestedToUnstake
    self.initialWeight = nodeInfo.initialWeight
  }
}

pub struct DelegatorInfo {
  pub let id: UInt32
  pub let nodeID: String
  pub let tokensCommitted: UFix64
  pub let tokensStaked: UFix64
  pub let tokensUnstaking: UFix64
  pub let tokensRewarded: UFix64
  pub let tokensUnstaked: UFix64
  pub let tokensRequestedToUnstake: UFix64

  init(nodeID: String, delegatorID: UInt32) {
    let delegatorInfo = FlowIDTableStaking.DelegatorInfo(nodeID: nodeID, delegatorID: delegatorID)

    self.id = delegatorInfo.id
    self.nodeID = delegatorInfo.nodeID
    self.tokensCommitted = delegatorInfo.tokensCommitted
    self.tokensStaked = delegatorInfo.tokensStaked
    self.tokensUnstaking = delegatorInfo.tokensUnstaking
    self.tokensRewarded = delegatorInfo.tokensRewarded
    self.tokensUnstaked = delegatorInfo.tokensUnstaked
    self.tokensRequestedToUnstake = delegatorInfo.tokensRequestedToUnstake
  }
}

pub fun main(address: Address): Result {
  let tokenHolderRef = 
      getAuthAccount(address)
          .borrow<&LockedTokens.TokenHolder>(from: LockedTokens.TokenHolderStoragePath)

  var stakingInfo: StakingInfo? = nil
  if let tokenHolder = tokenHolderRef {
    let lockedAddress = tokenHolder.getLockedAccountAddress()       
    let lockedBalance = tokenHolder.getLockedAccountBalance()
    let unlockLimit = tokenHolder.getUnlockLimit()
    
    var nodeInfo: NodeInfo? = nil
    if let nodeID = tokenHolder.getNodeID() {
      nodeInfo = NodeInfo(nodeID: nodeID)
    }

    var delegatorNodeInfo: NodeInfo? = nil
    var delegatorInfo: DelegatorInfo? = nil
    if let delegatorNodeID = tokenHolder.getDelegatorNodeID() {
      if let delegatorID = tokenHolder.getDelegatorID() {
        delegatorNodeInfo = NodeInfo(nodeID: delegatorNodeID)
        delegatorInfo = DelegatorInfo(nodeID: delegatorNodeID, delegatorID: delegatorID)
      } 
    } 

    let epochInfo = EpochInfo(
      currentEpochCounter: FlowEpoch.currentEpochCounter,
      currentEpochPhase: FlowEpoch.currentEpochPhase.rawValue
    )

    stakingInfo = StakingInfo(
      epochInfo: epochInfo,
      lockedAddress: lockedAddress,
      lockedBalance: lockedBalance,
      unlockLimit: unlockLimit,
      nodeInfo: nodeInfo,
      delegatorNodeInfo: delegatorNodeInfo,
      delegatorInfo: delegatorInfo 
    )
  }

  return Result(stakingInfo: stakingInfo)
}