pub fun main(address: Address): [PublicPath] {
  let account = getAuthAccount(address)
  let cleandPaths: [PublicPath] = []
  for path in account.publicPaths {
    cleandPaths.append(path)
  }
  return cleandPaths
}