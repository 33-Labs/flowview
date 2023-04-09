pub fun main(address: Address): [String] {
  let account = getAccount(address)
  return account.contracts.names
}