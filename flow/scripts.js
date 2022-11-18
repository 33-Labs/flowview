import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"

export const getFTBalances = async (address) => {
  const code = `
  import FungibleToken from 0x9a0766d93b6608b7

  pub struct Balance {
  pub let path: String
  pub let type: Type
  pub let balance: UFix64

  init(path: String, type: Type, balance: UFix64) {
      self.path = path
      self.type = type
      self.balance = balance
  }
  }

  pub fun main(address: Address): [Balance] {
      let account = getAccount(address)
      let res: [Balance] = []
      let balanceCapType = Type<Capability<&AnyResource{FungibleToken.Balance}>>()
      account.forEachPublic(fun (path: PublicPath, type: Type): Bool {
          if (type.isSubtype(of: balanceCapType)) {
              let vaultRef = account
                  .getCapability(path)
                  .borrow<&{FungibleToken.Balance}>()

              if let vault = vaultRef {
                  let balance = Balance(path: path.toString(), type: type, balance: vault.balance)
                  res.append(balance)
              }
          }
          return true

      })
      return res
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

export const getStoredItems = async (address) => {
  const code = `
  import FungibleToken from 0x9a0766d93b6608b7
  import NonFungibleToken from 0x631e88ae7f1d7c20
   
  pub struct Item {
      pub let address: Address
      pub let path: String
      pub let type: Type
      pub let isNFTCollection: Bool
      pub let isVault: Bool
  
      init(address: Address, path: String, type: Type, isNFTCollection: Bool, isVault: Bool) {
          self.address = address
          self.path = path
          self.type = type
          self.isNFTCollection = isNFTCollection
          self.isVault = isVault
      }
  }
  
  pub fun main(address: Address): [Item] {
      let account = getAuthAccount(address)
      let items: [Item] = []
      let vaultType = Type<@FungibleToken.Vault>()
      let collectionType = Type<@NonFungibleToken.Collection>()
      account.forEachStored(fun (path: StoragePath, type: Type): Bool {
          let isNFTCollection = type.isSubtype(of: collectionType)
          let isVault = type.isSubtype(of: vaultType) 
          let item = Item(address: address, path: path.toString(), type: type, isNFTCollection: isNFTCollection, isVault: isVault)
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

