pub fun main(address: Address): [PrivatePath] {
  let account = getAuthAccount(address)
  let cleandPaths: [PrivatePath] = []
  for path in account.privatePaths {
    cleandPaths.append(path)
  }
  return cleandPaths
}