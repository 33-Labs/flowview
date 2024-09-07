import FungibleTokenSwitchboard from 0xFungibleTokenSwitchboard
import FungibleToken from 0xFungibleToken

access(all) struct SwitchboardInfo {
  access(all) let vaultTypes: [Type]

  init(vaultTypes: [Type]) {
    self.vaultTypes = vaultTypes
  }
}

access(all) fun main(address: Address): SwitchboardInfo? {
  let account = getAuthAccount<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(address)
  if let board = account.storage.borrow<&FungibleTokenSwitchboard.Switchboard>(from: FungibleTokenSwitchboard.StoragePath) {
    let types = board.getSupportedVaultTypes()
    let supportedTypes: [Type] = []
    types.forEachKey(fun (key: Type): Bool {
      if types[key] == true {
        supportedTypes.append(key)
      }
      return true
    })
    return SwitchboardInfo(vaultTypes: supportedTypes)
  }
  return nil
}