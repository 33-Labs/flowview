import FungibleTokenSwitchboard from 0xFungibleTokenSwitchboard
import FungibleToken from 0xFungibleToken

transaction {
  let capability: Capability<&{FungibleToken.Receiver}>
  let switchboardRef: &FungibleTokenSwitchboard.Switchboard

  prepare(signer: AuthAccount) {
    self.capability = signer.getCapability<&{FungibleToken.Receiver}>(__TOKEN_RECEIVER_PATH__)
    
    self.switchboardRef = signer.borrow<&FungibleTokenSwitchboard.Switchboard>
      (from: FungibleTokenSwitchboard.StoragePath) 
        ?? panic("Could not borrow reference to switchboard")
  }

  execute {
    self.switchboardRef.removeVault(capability: self.capability)
  }
}