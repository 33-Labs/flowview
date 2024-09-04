import "FungibleTokenSwitchboard"
import "FungibleToken"

transaction {
  prepare(acct: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account) {
    if acct.storage.borrow<&FungibleTokenSwitchboard.Switchboard>
      (from: FungibleTokenSwitchboard.StoragePath) == nil {
        acct.storage.save(
          <- FungibleTokenSwitchboard.createSwitchboard(), 
          to: FungibleTokenSwitchboard.StoragePath)

        acct.capabilities.publish(
          acct.capabilities.storage.issue<&{FungibleToken.Receiver}>(FungibleTokenSwitchboard.StoragePath),
          at: FungibleTokenSwitchboard.ReceiverPublicPath
        )
        acct.capabilities.publish(
          acct.capabilities.storage.issue<&FungibleTokenSwitchboard.Switchboard>(FungibleTokenSwitchboard.StoragePath),
          at: FungibleTokenSwitchboard.PublicPath
        )
    }
  }
}