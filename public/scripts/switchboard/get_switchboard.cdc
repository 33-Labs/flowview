import FungibleTokenSwitchboard from 0xFungibleTokenSwitchboard
import FungibleToken from 0xFungibleToken

pub struct SwitchboardInfo {
  pub let vaultTypes: [Type]

  init(vaultTypes: [Type]) {
    self.vaultTypes = vaultTypes
  }
}

pub fun main(address: Address): SwitchboardInfo? {
  let account = getAuthAccount(address)
  if let board = account.borrow<&FungibleTokenSwitchboard.Switchboard>(from: FungibleTokenSwitchboard.StoragePath) {
    let types = board.getVaultTypes()
    return SwitchboardInfo(vaultTypes: types)
  }
  return nil
}