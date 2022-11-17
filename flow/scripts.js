import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"

export const getAccountInfo = async (address) => {
  const code = `
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
  `

  const result = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  }) 

  return result
}

export const getItems = async (path, address) => {
  let func = "forEachPublic"
  let pathType = "PublicPath"
  if (path == "storage") {
    func = "forEachStored"
    pathType = "StoragePath"
  } else if (path == "private") {
    func = "forEachPrivate"
    pathType = "PrivatePath"
  }

  const code = `
  pub struct Item {
    pub let address: Address
    pub let path: String
    pub let type: Type

    init(address: Address, path: String, type: Type) {
      self.address = address
      self.path = path
      self.type = type
    }
  }

  pub fun main(address: Address): [Item] {
    let account = getAuthAccount(address)
    let items: [Item] = []
    account.${func}(fun (path: ${pathType}, type: Type): Bool {
      let item = Item(address: address, path: path.toString(), type: type)
      items.append(item)
      return true
    })
    return items
  }
  `

  const items = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  }) 

  return items
}

