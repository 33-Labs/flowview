access(all) fun main(address: Address, pathStr: String): &AnyResource? {
  let account = getAuthAccount<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(address)
  let path = StoragePath(identifier: pathStr)!
  return account.storage.borrow<&AnyResource>(from: path)
}