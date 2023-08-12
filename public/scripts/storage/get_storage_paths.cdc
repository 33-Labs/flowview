pub fun main(address: Address): [StoragePath] {
  __OUTDATED_PATHS__

  let account = getAuthAccount(address)
  let cleandPaths: [StoragePath] = []
  for path in account.storagePaths {
    if (outdatedPaths.containsKey(path)) {
      continue
    }

    cleandPaths.append(path)
  }
  return cleandPaths
}