pub struct Item {
  pub let address: Address
  pub let path: String
  pub let targetPath: String?

  init(address: Address, path: String, targetPath: String?) {
    self.address = address
    self.path = path
    self.targetPath = targetPath
  }
}

pub fun main(address: Address): [Item] {
  let account = getAuthAccount(address)
  let items: [Item] = []

  __OUTDATED_PATHS__
  for path in account.publicPaths {
    if (outdatedPaths.containsKey(path)) {
      continue
    }

    var targetPath: String? = nil
    if let target = account.getLinkTarget(path) {
      targetPath = target.toString()
    }

    let item = Item(address: address, path: path.toString(), targetPath: targetPath)
    items.append(item)
  }

  return items
}