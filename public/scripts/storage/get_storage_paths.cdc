access(all) fun main(address: Address): [StoragePath] {
  __OUTDATED_PATHS__

  let account = getAuthAccount<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(address)
  let cleandPaths: [StoragePath] = []
  for path in account.storage.storagePaths {
    if (outdatedPaths.containsKey(path)) {
      continue
    }

    cleandPaths.append(path)
  }
  return cleandPaths
}