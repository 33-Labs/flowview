// A workaround method
import FungibleToken from 0xFungibleToken
import NonFungibleToken from 0xNonFungibleToken
  
access(all) struct Item {
  access(all) let address: Address
  access(all) let path: String
  access(all) let type: Type

  access(all) let targetPath: String?

  init(
    address: Address, 
    path: String, 
    type: Type, 
    targetPath: String?
  ) {
    self.address = address
    self.path = path
    self.type = type
    self.targetPath = targetPath
  }
}

access(all) fun main(address: Address, pathMap: {String: Bool}): [Item] {
  let account = getAuthAccount<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(address)

  let items: [Item] = []
  account.storage.forEachPublic(fun (path: PublicPath, type: Type): Bool {
    if !pathMap.containsKey(path.toString()) {
      return true
    }

    var targetPath: String? = nil

    // FIXME: This is a workaround to check if the path is a capability
    // There is no getLinkTarget method anymore
    if account.capabilities.exists(path) {
      targetPath = path.toString()
    }

    let item = Item(
      address: address,
      path: path.toString(),
      type: type,
      targetPath: targetPath
    )

    items.append(item)
    return false
  })

  return items
}