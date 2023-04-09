pub fun main(address: Address, pathStr: String): &AnyResource? {
  let account = getAuthAccount(address)
  let path = StoragePath(identifier: pathStr)!
  return account.borrow<&AnyResource>(from: path)
}