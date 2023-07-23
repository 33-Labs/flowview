pub fun main(address: Address): [StoragePath] {
  let account = getAuthAccount(address)
  let cleandPaths: [StoragePath] = []
  for path in account.storagePaths {
    cleandPaths.append(path)
  }
  return cleandPaths
}