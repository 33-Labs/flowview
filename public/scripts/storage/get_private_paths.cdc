pub fun main(address: Address): [PrivatePath] {
  __OUTDATED_PATHS__

  let account = getAuthAccount(address)
  let cleandPaths: [PrivatePath] = []
  for path in account.privatePaths {
    if (outdatedPaths.containsKey(path)) {
      continue
    }

    cleandPaths.append(path)
  }
  return cleandPaths
}