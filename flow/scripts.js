import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"

const NFTCatalogPath = "0xNFTCatalog"

export const getNFTsWithCollectionID = (nfts, catalogTypeData) => {
  return nfts.map((nft) => {
    let typeInfo = catalogTypeData[nft.nftType]
    let collectionIdentifier = null
    if (typeInfo) {
      for (const [collectionID, exist] of Object.entries(typeInfo)) {
        if (exist) {
          collectionIdentifier = collectionID
          break
        }
      }
    }
    return {...nft, collectionIdentifier: collectionIdentifier}
  })
}

const splitList = (list, chunkSize) => {
  const groups = []
  let currentGroup = []
  for (let i = 0; i < list.length; i++) {
      const collectionID = list[i]
      if (currentGroup.length >= chunkSize) {
        groups.push([...currentGroup])
        currentGroup = []
      }
      currentGroup.push(collectionID)
  }
  groups.push([...currentGroup])
  return groups
}

export const getNftCatalog = async (nfts) => {
  const collectionIDs = nfts.filter((n) => {
    return n.collectionIdentifier != null
  }).map((n) => n.collectionIdentifier)

  const groups = splitList(collectionIDs, 20) 
  const promises = groups.map((group) => {
    return getCatalogOfCollections(group)
  }) 
  const catalogs = await Promise.all(promises)
  const catalog = catalogs.reduce((acc, current) => {
    return Object.assign(acc, current)
  }, {}) 

  return catalog
}

export const getNftsWithIDs = async (address, nfts) => {
  const publicPaths = nfts.map((n) => n.path)
  const groups = splitList(publicPaths, 20)
  const promises = groups.map(async (group) => {
    const nftIDs = await getNftIDs(address, group)
    const result = {}
    for (const [path, ids] of Object.entries(nftIDs)) {
      const sortedIDs = ids.map((id) => parseInt(id)).sort((a, b) => a - b)
      result[path] = sortedIDs
    }
    return result
  })

  const ids = await Promise.all(promises)
  const idsMap = ids.reduce((acc, current) => {
    return Object.assign(acc, current)
  }, {})

  return nfts.map((n) => {
    return {...n, nftIDs: idsMap[n.path]}
  })
}

export const getCatalogOfCollections = async (collectionIDs) => {
  const code = `
  import NFTCatalog from 0xNFTCatalog
  import MetadataViews from 0x631e88ae7f1d7c20

  pub struct Metadata {
    pub let squareImage: MetadataViews.Media

    init(squareImage: MetadataViews.Media) {
        self.squareImage = squareImage
    }
  }

  pub fun main(collectionIdentifiers: [String]): {String: Metadata} {
    let res: {String: Metadata} = {}
    for collectionID in collectionIdentifiers {
        if let catalog = NFTCatalog.getCatalogEntry(collectionIdentifier: collectionID) {
            res[collectionID] = Metadata(squareImage: catalog.collectionDisplay.squareImage)
        }
    }
    return res
  }
  `
  .replace(NFTCatalogPath, publicConfig.nftCatalogAddress)

  const typeData = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(collectionIDs, t.Array(t.String))
    ]
  }) 

  return typeData  
}

export const getNftIDs = async (address, publicPaths) => {
  // NOTE: publicPathIDs without domain "/public/"
  const publicPathIDs = publicPaths.map((p) => p.replace("/public/", ""))

  let code = `
  import NonFungibleToken from 0x631e88ae7f1d7c20

  pub fun main(address: Address, publicPathIDs: [String]): {String: [UInt64]} {
    let account = getAuthAccount(address)
    let res: {String: [UInt64]} = {}
    for identifier in publicPathIDs {
        let path = PublicPath(identifier: identifier)!
        let collectionRef = account.getCapability<&{NonFungibleToken.CollectionPublic}>(path).borrow()!
        let ids = collectionRef.getIDs()
        res[path.toString()] = ids    
    }
    return res
  }
  `

  const amounts = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(publicPathIDs, t.Array(t.String))
    ]
  }) 

  return amounts
}

export const getCatalogTypeData = async () => {
  const code = `
  import NFTCatalog from 0xNFTCatalog

  pub fun main(): {String : {String : Bool}} {
    let catalog = NFTCatalog.getCatalogTypeData()
    return catalog
  }
  `
  .replace(NFTCatalogPath, publicConfig.nftCatalogAddress)

  const typeData = await fcl.query({
    cadence: code
  }) 

  return typeData 
}

export const getNfts = async (address) => {
  const code = `
  import NonFungibleToken from 0x631e88ae7f1d7c20

  pub struct Item {
      pub let address: Address
      pub let path: String
      pub let type: Type

      init(
          address: Address, 
          path: String,
          type: Type
      ) {
          self.address = address
          self.path = path
          self.type = type
      }
  }

  pub fun main(address: Address): [Item] {
      let account = getAuthAccount(address)
      let items: [Item] = []
      let collectionType = Type<Capability<&AnyResource{NonFungibleToken.CollectionPublic}>>()
      account.forEachPublic(fun (path: PublicPath, type: Type): Bool {
          let isNFTCollection = type.isSubtype(of: collectionType)
          if (isNFTCollection) {
              let item = Item(
                  address: address, 
                  path: path.toString(),
                  type: type
              )
              items.append(item)
          }

          return true
      })
      return items
  }`

  const result = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  }) 

  return result 
}

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

export const getLinkedItems = async (path, address) => {
  if (path != "public" && path != "private") throw "invalid path"

  let func = "forEachPublic"
  let pathType = "PublicPath"
  if (path == "private") {
    func = "forEachPrivate"
    pathType = "PrivatePath"
  }

  const code = `
  pub struct Item {
    pub let address: Address
    pub let path: String
    pub let type: Type
    pub let linkTarget: String?

    init(address: Address, path: String, type: Type, linkTarget: String?) {
      self.address = address
      self.path = path
      self.type = type
      self.linkTarget = linkTarget
    }
  }

  pub fun main(address: Address): [Item] {
    let account = getAuthAccount(address)
    let items: [Item] = []
    account.${func}(fun (path: ${pathType}, type: Type): Bool {
      let target = account.getLinkTarget(path)
      var targetPath: String? = nil
      if let t = target {
        targetPath = t.toString()
      }
      let item = Item(address: address, path: path.toString(), type: type, linkTarget: targetPath)
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

