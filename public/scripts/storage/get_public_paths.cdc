access(all) fun main(address: Address): [PublicPath] {
  __OUTDATED_PATHS__

  let account = getAuthAccount<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(address)
  let cleandPaths: [PublicPath] = []
  for path in account.storage.publicPaths {
    if (outdatedPaths.containsKey(path)) {
      continue
    }

    cleandPaths.append(path)
  }
  return cleandPaths
}