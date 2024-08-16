import "FungibleTokenSwitchboard"
import "FungibleToken"

transaction {
  let capability: Capability<&{FungibleToken.Receiver}>
  let switchboardRef: auth(FungibleTokenSwitchboard.Owner) &FungibleTokenSwitchboard.Switchboard

  prepare(signer: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account) {
    self.capability = signer.capabilities.get<&{FungibleToken.Receiver}>(__TOKEN_RECEIVER_PATH__)
    
    self.switchboardRef = signer.storage.borrow<auth(FungibleTokenSwitchboard.Owner) &FungibleTokenSwitchboard.Switchboard>
      (from: FungibleTokenSwitchboard.StoragePath) 
        ?? panic("Could not borrow reference to switchboard")
  }

  execute {
    self.switchboardRef.removeVault(capability: self.capability)
  }
}