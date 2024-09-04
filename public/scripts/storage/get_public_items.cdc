import "FungibleToken"
import "NonFungibleToken"
  
access(all) struct Item {
  access(all) let address: Address
  access(all) let path: String
  access(all) let type: Type

  access(all) let targetPath: String?

  access(all) let isCollectionCap: Bool
  access(all) let tokenIDs: [UInt64]

  access(all) let isBalanceCap: Bool
  access(all) let balance: UFix64?

  init(
    address: Address, 
    path: String, 
    type: Type, 
    targetPath: String?, 
    isCollectionCap: Bool, 
    tokenIDs: [UInt64],
    isBalanceCap: Bool,
    balance: UFix64?
  ) {
    self.address = address
    self.path = path
    self.type = type
    self.targetPath = targetPath
    self.isCollectionCap = isCollectionCap
    self.tokenIDs = tokenIDs
    self.isBalanceCap = isBalanceCap
    self.balance = balance
  }
}

access(all) fun main(address: Address, pathMap: {String: Bool}): [Item] {
  let account = getAuthAccount<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(address)

  let items: [Item] = []
  let balanceCapType = Type<Capability<&{FungibleToken.Balance}>>()
  let collectionType = Type<Capability<&{NonFungibleToken.Collection}>>()

  account.storage.forEachPublic(fun (path: PublicPath, type: Type): Bool {
    if !pathMap.containsKey(path.toString()) {
      return true
    }

    var targetPath: String? = nil
    var isCollectionCap = false
    var isBalanceCap = false
    var tokenIDs: [UInt64] = []
    var balance: UFix64? = nil

    // FIXME: This is a workaround to check if the path is a capability
    // There is no getLinkTarget method anymore
    if account.capabilities.exists(path) {
      targetPath = path.toString()
    }

    if (type.isSubtype(of: balanceCapType)) {
      isBalanceCap = true
      let vaultRef = account
          .capabilities.get<&{FungibleToken.Balance}>(path)
          .borrow()

      if let vault = vaultRef {
          balance = vault.balance
      }
    } else if (type.isSubtype(of: collectionType)) {
      isCollectionCap = true
      let collectionRef = account
        .capabilities.get<&{NonFungibleToken.CollectionPublic}>(path)
        .borrow()

      if let collection = collectionRef {
        tokenIDs = collection.getIDs()
      }
    }

    let item = Item(
      address: address,
      path: path.toString(),
      type: type,
      targetPath: targetPath,
      isCollectionCap: isCollectionCap,
      tokenIDs: tokenIDs,
      isBalanceCap: isBalanceCap,
      balance: balance
    )

    items.append(item)
    return true
  })

  return items
}