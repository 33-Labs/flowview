access(all) fun main(address: Address): [String] {
  let account = getAccount(address)
  let names = account.contracts.names
  let retNames: [String] = []
  for name in names {
    retNames.append(name)
  }
  return retNames
}