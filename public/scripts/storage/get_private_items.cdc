pub struct Item {
  pub let address: Address
  pub let path: String
  pub let type: Type
  pub let targetPath: String?

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

pub fun main(address: Address, pathMap: {String: Bool}): [Item] {
  let account = getAuthAccount(address)

  let items: [Item] = []
  account.forEachPrivate(fun (path: PrivatePath, type: Type): Bool {
    if !pathMap.containsKey(path.toString()) {
      return true
    }

    var targetPath: String? = nil
    if let target = account.getLinkTarget(path) {
      targetPath = target.toString()
    }

    let item = Item(
      address: address,
      path: path.toString(),
      type: type,
      targetPath: targetPath
    )

    items.append(item)
    return true
  })

  return items
}