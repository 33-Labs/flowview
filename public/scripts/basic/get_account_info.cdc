pub struct Result {
  pub let address: Address
  pub let balance: UFix64
  pub let availableBalance: UFix64
  pub let storageUsed: UInt64
  pub let storageCapacity: UInt64

  init(
    address: Address,
    balance: UFix64,
    availableBalance: UFix64,
    storageUsed: UInt64,
    storageCapacity: UInt64
  ) {
    self.address = address
    self.balance = balance
    self.availableBalance = availableBalance
    self.storageUsed = storageUsed
    self.storageCapacity = storageCapacity
  }
}

pub fun main(address: Address): Result {
  let account = getAuthAccount(address)
  return Result(
    address: account.address,
    balance: account.balance,
    availableBalance: account.availableBalance,
    storageUsed: account.storageUsed,
    storageCapacity: account.storageCapacity
  )
}