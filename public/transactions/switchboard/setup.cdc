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