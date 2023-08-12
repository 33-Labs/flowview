pub fun main(address: Address): [PublicPath] {
  __OUTDATED_PATHS__

  let account = getAuthAccount(address)
  let cleandPaths: [PublicPath] = []
  for path in account.publicPaths {
    if (outdatedPaths.containsKey(path)) {
      continue
    }

    cleandPaths.append(path)
  }
  return cleandPaths
}