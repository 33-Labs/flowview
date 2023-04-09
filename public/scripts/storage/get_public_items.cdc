import FungibleToken from 0xFungibleToken
import NonFungibleToken from 0xNonFungibleToken
  
pub struct Item {
  pub let address: Address
  pub let path: String
  pub let type: Type

  pub let targetPath: String?

  pub let isCollectionCap: Bool
  pub let tokenIDs: [UInt64]

  pub let isBalanceCap: Bool
  pub let balance: UFix64?

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

pub fun main(address: Address, pathMap: {String: Bool}): [Item] {
  let account = getAuthAccount(address)

  let items: [Item] = []
  let balanceCapType = Type<Capability<&AnyResource{FungibleToken.Balance}>>()
  let collectionType = Type<Capability<&AnyResource{NonFungibleToken.CollectionPublic}>>()

  account.forEachPublic(fun (path: PublicPath, type: Type): Bool {
    if !pathMap.containsKey(path.toString()) {
      return true
    }

    var targetPath: String? = nil
    var isCollectionCap = false
    var isBalanceCap = false
    var tokenIDs: [UInt64] = []
    var balance: UFix64? = nil

    if let target = account.getLinkTarget(path) {
      targetPath = target.toString()
    }

    if (type.isSubtype(of: balanceCapType)) {
      isBalanceCap = true
      let vaultRef = account
          .getCapability(path)
          .borrow<&{FungibleToken.Balance}>()

      if let vault = vaultRef {
          balance = vault.balance
      }
    } else if (type.isSubtype(of: collectionType)) {
      isCollectionCap = true
      let collectionRef = account
        .getCapability(path)
        .borrow<&{NonFungibleToken.CollectionPublic}>()

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