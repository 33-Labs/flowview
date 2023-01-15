import * as fcl from "@onflow/fcl"
import { txHandler } from "./transactions"

export const setupSwitchboard = async (
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doSetupSwitchboard()
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doSetupSwitchboard = async () => {
  const code = `
  import FungibleTokenSwitchboard from 0xFungibleTokenSwitchboard
  import FungibleToken from 0xFungibleToken
  
  transaction {
      prepare(acct: AuthAccount) {
          if acct.borrow<&FungibleTokenSwitchboard.Switchboard>
            (from: FungibleTokenSwitchboard.StoragePath) == nil {
              acct.save(
                  <- FungibleTokenSwitchboard.createSwitchboard(), 
                  to: FungibleTokenSwitchboard.StoragePath)
  
              acct.link<&FungibleTokenSwitchboard.Switchboard{FungibleToken.Receiver}>(
                  FungibleTokenSwitchboard.ReceiverPublicPath,
                  target: FungibleTokenSwitchboard.StoragePath
              )
              
              acct.link<&FungibleTokenSwitchboard.Switchboard{FungibleTokenSwitchboard.SwitchboardPublic, FungibleToken.Receiver}>(
                  FungibleTokenSwitchboard.PublicPath,
                  target: FungibleTokenSwitchboard.StoragePath
              )
          }
      }
  }
  `

  const transactionId = await fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const addNewVault = async (
  tokenReceiverPath,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doAddNewVault(tokenReceiverPath)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doAddNewVault = async (tokenReceiverPath) => {
  const code = `
  import FungibleTokenSwitchboard from 0xFungibleTokenSwitchboard
  import FungibleToken from 0xFungibleToken
  
  transaction {
      let capability: Capability<&{FungibleToken.Receiver}>
      let switchboardRef:  &FungibleTokenSwitchboard.Switchboard
  
      prepare(signer: AuthAccount) {
          self.capability= 
              signer.getCapability<&{FungibleToken.Receiver}>(${tokenReceiverPath})
          
          assert(self.capability.check(), 
              message: "Signer does not have a token receiver capability")
          
          self.switchboardRef = signer.borrow<&FungibleTokenSwitchboard.Switchboard>
              (from: FungibleTokenSwitchboard.StoragePath) 
              ?? panic("Could not borrow reference to switchboard")
      }
  
      execute {
          self.switchboardRef.addNewVault(capability: self.capability)
      }
  }
  `

  const transactionId = await fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const removeVault = async (
  tokenReceiverPath,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doRemoveVault(tokenReceiverPath)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doRemoveVault = async (tokenReceiverPath) => {
  const code = `
  import FungibleTokenSwitchboard from 0xFungibleTokenSwitchboard
  import FungibleToken from 0xFungibleToken

  transaction {
    let capability: Capability<&{FungibleToken.Receiver}>
    let switchboardRef: &FungibleTokenSwitchboard.Switchboard

    prepare(signer: AuthAccount) {
      self.capability = signer.getCapability<&{FungibleToken.Receiver}>(${tokenReceiverPath})
      
      self.switchboardRef = signer.borrow<&FungibleTokenSwitchboard.Switchboard>
        (from: FungibleTokenSwitchboard.StoragePath) 
          ?? panic("Could not borrow reference to switchboard")
    }

    execute {
      self.switchboardRef.removeVault(capability: self.capability)
    }
  }
  `

  const transactionId = await fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}