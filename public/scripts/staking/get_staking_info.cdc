import LockedTokens from 0x8d0e87b65159ae63
import FlowIDTableStaking from 0x8624b52f9ddcd04a
import FlowEpoch from 0x8624b52f9ddcd04a
import FlowStakingCollection from 0x8d0e87b65159ae63

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

pub struct LockedAccountInfo {
  pub let lockedAddress: Address   
  pub let lockedBalance: UFix64
  pub let unlockLimit: UFix64 

  init(
    lockedAddress: Address,
    lockedBalance: UFix64,
    unlockLimit: UFix64,
  ) {
    self.lockedAddress = lockedAddress
    self.lockedBalance = lockedBalance
    self.unlockLimit = unlockLimit
  }
}

pub struct StakingInfo {
  pub let epochInfo: EpochInfo
  pub let lockedAccountInfo: LockedAccountInfo?
  pub let nodeInfos: [NodeInfo]
  pub let delegatorInfos: [DelegatorInfo]
  pub let machineAccounts: {String: FlowStakingCollection.MachineAccountInfo}

  init(
    epochInfo: EpochInfo,
    lockedAccountInfo: LockedAccountInfo?,
    nodeInfos: [NodeInfo],
    delegatorInfos: [DelegatorInfo],
    machineAccounts: {String: FlowStakingCollection.MachineAccountInfo}
  ) {
    self.epochInfo = epochInfo
    self.lockedAccountInfo = lockedAccountInfo
    self.nodeInfos = nodeInfos
    self.delegatorInfos = delegatorInfos
    self.machineAccounts = machineAccounts
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
  pub let nodeInfo: NodeInfo
  pub let tokensCommitted: UFix64
  pub let tokensStaked: UFix64
  pub let tokensUnstaking: UFix64
  pub let tokensRewarded: UFix64
  pub let tokensUnstaked: UFix64
  pub let tokensRequestedToUnstake: UFix64

  init(nodeID: String, delegatorID: UInt32) {
    let delegatorInfo = FlowIDTableStaking.DelegatorInfo(nodeID: nodeID, delegatorID: delegatorID)
    let nodeInfo = NodeInfo(nodeID: delegatorInfo.nodeID)

    self.id = delegatorInfo.id
    self.nodeID = delegatorInfo.nodeID
    self.nodeInfo = nodeInfo
    self.tokensCommitted = delegatorInfo.tokensCommitted
    self.tokensStaked = delegatorInfo.tokensStaked
    self.tokensUnstaking = delegatorInfo.tokensUnstaking
    self.tokensRewarded = delegatorInfo.tokensRewarded
    self.tokensUnstaked = delegatorInfo.tokensUnstaked
    self.tokensRequestedToUnstake = delegatorInfo.tokensRequestedToUnstake
  }
}

pub fun main(address: Address): Result {
  let epochInfo = EpochInfo(
    currentEpochCounter: FlowEpoch.currentEpochCounter,
    currentEpochPhase: FlowEpoch.currentEpochPhase.rawValue
  )

  let tokenHolderRef = 
      getAuthAccount(address)
          .borrow<&LockedTokens.TokenHolder>(from: LockedTokens.TokenHolderStoragePath)

  var stakingInfo: StakingInfo? = nil
  if let tokenHolder = tokenHolderRef {
    let lockedAddress = tokenHolder.getLockedAccountAddress()       
    let lockedBalance = tokenHolder.getLockedAccountBalance()
    let unlockLimit = tokenHolder.getUnlockLimit()
    let lockedAccountInfo = LockedAccountInfo(
      lockedAddress: lockedAddress,
      lockedBalance: lockedBalance,
      unlockLimit: unlockLimit
    )
    
    var nodeInfo: NodeInfo? = nil
    if let nodeID = tokenHolder.getNodeID() {
      nodeInfo = NodeInfo(nodeID: nodeID)
    }

    var delegatorInfo: DelegatorInfo? = nil
    if let delegatorNodeID = tokenHolder.getDelegatorNodeID() {
      if let delegatorID = tokenHolder.getDelegatorID() {
        delegatorInfo = DelegatorInfo(nodeID: delegatorNodeID, delegatorID: delegatorID)
      } 
    } 

    let nodeInfos: [NodeInfo] = []
    if let nodeInfo = nodeInfo {
      nodeInfos.append(nodeInfo)
    }

    let delegatorInfos: [DelegatorInfo] = []
    if let delegatorInfo = delegatorInfo {
      delegatorInfos.append(delegatorInfo)
    }
    stakingInfo = StakingInfo(
      epochInfo: epochInfo,
      lockedAccountInfo: lockedAccountInfo,
      nodeInfos: nodeInfos,
      delegatorInfos: delegatorInfos,
      machineAccounts: {}
    )
  } else {
    let stakingCollectionRef =
      getAuthAccount(address)
        .borrow<&FlowStakingCollection.StakingCollection>(from: FlowStakingCollection.StakingCollectionStoragePath)

    if let stakingCollection = stakingCollectionRef {
      let rawNodeInfos = stakingCollection.getAllNodeInfo()

      let nodeInfos: [NodeInfo] = []
      for rawNodeInfo in rawNodeInfos {
        let nodeInfo = NodeInfo(nodeID: rawNodeInfo.id)
        nodeInfos.append(nodeInfo)
      }

      let delegatorInfos: [DelegatorInfo] = []
      let rawDelegatorInfos = stakingCollection.getAllDelegatorInfo()
      for rawDelegatorInfo in rawDelegatorInfos {
        let delegatorInfo = DelegatorInfo(nodeID: rawDelegatorInfo.nodeID, delegatorID: rawDelegatorInfo.id)
        delegatorInfos.append(delegatorInfo)
      }

      stakingInfo = StakingInfo(
        epochInfo: epochInfo,
        lockedAccountInfo: nil,
        nodeInfos: nodeInfos,
        delegatorInfos: delegatorInfos,
        machineAccounts: stakingCollection.getMachineAccounts()
      )
    }
  }

  return Result(stakingInfo: stakingInfo)
}