access(all) fun main(address: Address, pathStr: String): &AnyStruct? {
  let account = getAuthAccount<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(address)
  let path = StoragePath(identifier: pathStr)!
  return account.storage.borrow<&AnyStruct>(from: path)
}