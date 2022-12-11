import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"
import { outdatedPathsMainnet } from "./mainnet_outdated_paths"
import { outdatedPathsTestnet } from "./testnet_outdated_paths"

const outdatedPaths = (network) => {
  if (network == "mainnet") {
    return outdatedPathsMainnet
  }
  return outdatedPathsTestnet
}

// --- Utils ---

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

// --- Basic Info ---

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

// --- Keys ---

export const getKeys = async (address) => {
  const accountInfo = await fcl.send([ fcl.getAccount(fcl.sansPrefix(address)) ])
  return accountInfo.account.keys.sort((a, b) => a.keyIndex - b.keyIndex)
}

// --- Domains ---

export const getDefaultDomainsOfAddress = async (address) => {
  const code = `
  import DomainUtils from 0xFlowbox

  pub fun main(address: Address): {String: String} {
    return DomainUtils.getDefaultDomainsOfAddress(address)
  }
  `

  const domains = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  }) 

  return domains
}

export const getAddressOfDomain = async (domain) => {
  const comps = domain.split(".")
  const name = comps[0]
  const root = comps[1]

  const code = `
  import DomainUtils from 0xFlowbox

  pub fun main(name: String, root: String): Address? {
    return DomainUtils.getAddressOfDomain(name: name, root: root)
  }
  `

  const address = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(name, t.String),
      arg(root, t.String),
    ]
  }) 

  return address
}

// --- Collections ---

// export const getNftMetadataViews = async (address, storagePathID, tokenIDs) => {
//   const ids = tokenIDs.map((id) => `${id}`)
//   const code = `
//   import NonFungibleToken from 0xNonFungibleToken
//   import MetadataViews from 0xMetadataViews

//   pub fun main(address: Address, storagePathID: String, tokenIDs: [UInt64]): {UInt64: MetadataViews.Display?}{
//     let account = getAuthAccount(address)
//     let res: {UInt64: MetadataViews.Display?} = {}

//     let path = StoragePath(identifier: storagePathID)!
//     let collectionRef = account.borrow<&{MetadataViews.ResolverCollection}>(from: path)
//     if (collectionRef == nil) {
//       for tokenID in tokenIDs {
//         res[tokenID] = MetadataViews.Display(
//           name: storagePathID,
//           description: "",
//           thumbnail: MetadataViews.HTTPFile(url: "")
//         )
//       }
//       return res
//     }

//     for tokenID in tokenIDs {
//       let resolver = collectionRef!.borrowViewResolver(id: tokenID)
//       let views = resolver.getViews()
//       for view in views {
//         if view.isInstance(Type<MetadataViews.Display>) {

//         } else if view.isInstance(Type<MetadataViews.Editions>) {

//         } else if view.isInstance(Type<MetadataViews.Serial>) {

//         } else if view.isInstance(Type<MetadataViews.Royalties>) {

//         } else if view.isInstance(Type<MetadataViews.Medias>) {

//         } else if view.isInstance(Type<MetadataViews.License>) {

//         } else if view.isInstance(Type<MetadataViews.ExternalURL>) {

//         } else if view.isInstance(Type<MetadataViews.Traits>) {

//         }
//       }

//       if let display = MetadataViews.getDisplay(resolver) {
//         res[tokenID] = display
//       } else {
//         res[tokenID] = MetadataViews.Display(
//           name: storagePathID,
//           description: "",
//           thumbnail: MetadataViews.HTTPFile(url: "")
//         )
//       }
//     }
//     return res
//   }
//   `

//   const displays = await fcl.query({
//     cadence: code,
//     args: (arg, t) => [
//       arg(address, t.Address),
//       arg(storagePathID, t.String),
//       arg(ids, t.Array(t.UInt64))
//     ]
//   }) 

//   return displays   
// }

export const getNftViews = async (address, storagePathID, tokenIDs) => {
  const ids = tokenIDs.map((id) => `${id}`)
  const code = `
  import NonFungibleToken from 0xNonFungibleToken
  import MetadataViews from 0xMetadataViews

  pub struct ViewInfo {
    pub let name: String
    pub let description: String
    pub let thumbnail: AnyStruct{MetadataViews.File}
    pub let rarity: String?
    pub let collectionDisplay: MetadataViews.NFTCollectionDisplay?

    init(name: String, description: String, thumbnail: AnyStruct{MetadataViews.File}, rarity: String?, collectionDisplay: MetadataViews.NFTCollectionDisplay?) {
      self.name = name
      self.description = description
      self.thumbnail = thumbnail
      self.rarity = rarity
      self.collectionDisplay = collectionDisplay
    }
  }

  pub fun main(address: Address, storagePathID: String, tokenIDs: [UInt64]): {UInt64: ViewInfo}{
    let account = getAuthAccount(address)
    let res: {UInt64: ViewInfo} = {}
    var collectionDisplayFetched = false

    let path = StoragePath(identifier: storagePathID)!
    let collectionRef = account.borrow<&{MetadataViews.ResolverCollection}>(from: path)
    if (collectionRef == nil) {
      for tokenID in tokenIDs {
        res[tokenID] = ViewInfo(
          name: storagePathID,
          description: "",
          thumbnail: MetadataViews.HTTPFile(url: ""),
          rarity: nil,
          collectionDisplay: nil
        )
      }
      return res
    }

    for tokenID in tokenIDs {
      let resolver = collectionRef!.borrowViewResolver(id: tokenID)
      if let display = MetadataViews.getDisplay(resolver) {
        var rarityDesc: String? = nil
        if let rarityView = MetadataViews.getRarity(resolver) {
          rarityDesc = rarityView.description
        }

        var collectionDisplay: MetadataViews.NFTCollectionDisplay? = nil
        if (!collectionDisplayFetched) {
          if let cDisplay = MetadataViews.getNFTCollectionDisplay(resolver) {
            collectionDisplay = cDisplay
            collectionDisplayFetched = true
          }
        }

        res[tokenID] = ViewInfo(
          name: display.name,
          description: display.description,
          thumbnail: display.thumbnail,
          rarity: rarityDesc,
          collectionDisplay: collectionDisplay
        )
      } else {
        res[tokenID] = ViewInfo(
          name: storagePathID,
          description: "",
          thumbnail: MetadataViews.HTTPFile(url: ""),
          rarity: nil,
          collectionDisplay: nil
        )
      }
    }
    return res
  }
  `

  const displays = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(storagePathID, t.String),
      arg(ids, t.Array(t.UInt64))
    ]
  }) 

  return displays  
}

export const bulkGetNftViews = async (address, collection, limit, offset) => {
  const totalTokenIDs = collection.tokenIDs
  const tokenIDs = totalTokenIDs.slice(offset, offset + limit)

  const groups = splitList(tokenIDs, 20) 
  const promises = groups.map((group) => {
    return getNftViews(address, collection.path.replace("/storage/", ""), group)
  }) 
  const displayGroups = await Promise.all(promises)
  const displays = displayGroups.reduce((acc, current) => {
    return Object.assign(acc, current)
  }, {}) 

  return displays
}

// --- old ---

export const getNftDisplays = async (address, storagePathID, tokenIDs) => {
  const ids = tokenIDs.map((id) => `${id}`)
  const code = `
  import NonFungibleToken from 0xNonFungibleToken
  import MetadataViews from 0xMetadataViews

  pub fun main(address: Address, storagePathID: String, tokenIDs: [UInt64]): {UInt64: MetadataViews.Display?}{
    let account = getAuthAccount(address)
    let res: {UInt64: MetadataViews.Display?} = {}

    let path = StoragePath(identifier: storagePathID)!
    let collectionRef = account.borrow<&{MetadataViews.ResolverCollection}>(from: path)
    if (collectionRef == nil) {
      for tokenID in tokenIDs {
        res[tokenID] = MetadataViews.Display(
          name: storagePathID,
          description: "",
          thumbnail: MetadataViews.HTTPFile(url: "")
        )
      }
      return res
    }

    for tokenID in tokenIDs {
      let resolver = collectionRef!.borrowViewResolver(id: tokenID)
      if let display = MetadataViews.getDisplay(resolver) {
        res[tokenID] = display
      } else {
        res[tokenID] = MetadataViews.Display(
          name: storagePathID,
          description: "",
          thumbnail: MetadataViews.HTTPFile(url: "")
        )
      }
    }
    return res
  }
  `

  const displays = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(storagePathID, t.String),
      arg(ids, t.Array(t.UInt64))
    ]
  }) 

  return displays  
}

export const bulkGetNftDisplays = async (address, collection, limit, offset) => {
  const totalTokenIDs = collection.tokenIDs
  const tokenIDs = totalTokenIDs.slice(offset, offset + limit)

  const groups = splitList(tokenIDs, 20) 
  const promises = groups.map((group) => {
    return getNftDisplays(address, collection.path.replace("/storage/", ""), group)
  }) 
  const displayGroups = await Promise.all(promises)
  const displays = displayGroups.reduce((acc, current) => {
    return Object.assign(acc, current)
  }, {}) 

  return displays
}

export const getLinkedItems = async (path, address) => {
  if (path != "public" && path != "private") throw "invalid path"

  let func = "forEachPublic"
  let pathType = "PublicPath"
  let outdated = outdatedPaths(publicConfig.chainEnv).public
  if (path == "private") {
    func = "forEachPrivate"
    pathType = "PrivatePath"
    outdated = outdatedPaths(publicConfig.chainEnv).private
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
    ${outdated}
    let account = getAuthAccount(address)
    let items: [Item] = []
    account.${func}(fun (path: ${pathType}, type: Type): Bool {
      if (outdatedPaths.containsKey(path)) {
        return true
      }
      
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

// --- NFT Catalog ---

export const bulkGetNftCatalog = async () => {
  const collectionIdentifiers = await getCollectionIdentifiers()
  const groups = splitList(collectionIdentifiers, 50)
  const promises = groups.map((group) => {
    return getNftCatalogByCollectionIDs(group)
  })

  const itemGroups = await Promise.all(promises)
  const items = itemGroups.reduce((acc, current) => {
    return Object.assign(acc, current)
  }, {}) 
  return items 
}

export const getNftCatalogByCollectionIDs = async (collectionIDs) => {
  const code = `
  import NFTCatalog from 0xNFTCatalog

  pub fun main(collectionIdentifiers: [String]): {String: NFTCatalog.NFTCatalogMetadata} {
    let res: {String: NFTCatalog.NFTCatalogMetadata} = {}
    for collectionID in collectionIdentifiers {
        if let catalog = NFTCatalog.getCatalogEntry(collectionIdentifier: collectionID) {
          res[collectionID] = catalog
        }
    }
    return res
  }
  `

  const catalogs = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(collectionIDs, t.Array(t.String))
    ]
  }) 

  return catalogs  
}

const getCollectionIdentifiers = async () => {
  const typeData = await getCatalogTypeData()

  const collectionData = Object.values(typeData)
  const collectionIdentifiers = []
  for (let i = 0; i < collectionData.length; i++) {
    const data = collectionData[i]
    let collectionIDs = Object.keys(Object.assign({}, data))
    if (collectionIDs.length > 0) {
      collectionIdentifiers.push(collectionIDs[0])
    }
  }
  return collectionIdentifiers
}

const getCatalogTypeData = async () => {
  const code = `
  import NFTCatalog from 0xNFTCatalog

  pub fun main(): {String : {String : Bool}} {
    let catalog = NFTCatalog.getCatalogTypeData()
    return catalog
  }
  `

  const typeData = await fcl.query({
    cadence: code
  }) 

  return typeData 
}

// --- Storage Items ---

export const bulkGetStoredItems = async (address) => {
  const paths = await getStoragePaths(address)
  const groups = splitList(paths.map((p) => p.identifier), 100)
  const promises = groups.map((group) => {
    return getStoredItems(address, group)
  })

  const itemGroups = await Promise.all(promises)
  const items = itemGroups.reduce((acc, curr) => {
    return acc.concat(curr)
  }, [])
  return items
}

export const getStoredItems = async (address, paths) => {
  const code = `
  import FungibleToken from 0xFungibleToken
  import NonFungibleToken from 0xNonFungibleToken
   
  pub struct Item {
      pub let address: Address
      pub let path: String
      pub let type: Type
      pub let isResource: Bool
      pub let isNFTCollection: Bool
      pub let tokenIDs: [UInt64]
      pub let isVault: Bool
      pub let balance: UFix64?
  
      init(address: Address, path: String, type: Type, isResource: Bool, isNFTCollection: Bool, tokenIDs: [UInt64], isVault: Bool, balance: UFix64?) {
          self.address = address
          self.path = path
          self.type = type
          self.isResource = isResource
          self.isNFTCollection = isNFTCollection
          self.tokenIDs = tokenIDs
          self.isVault = isVault
          self.balance = balance
      }
  }

  pub fun main(address: Address, pathIdentifiers: [String]): [Item] {
    let account = getAuthAccount(address)
    let resourceType = Type<@AnyResource>()
    let vaultType = Type<@FungibleToken.Vault>()
    let collectionType = Type<@NonFungibleToken.Collection>()
    let items: [Item] = []

    for identifier in pathIdentifiers {
      let path = StoragePath(identifier: identifier)!

      if let type = account.type(at: path) {
        let isResource = type.isSubtype(of: resourceType)

        let isNFTCollection = type.isSubtype(of: collectionType)
        var tokenIDs: [UInt64] = []
        if isNFTCollection {
          if let collectionRef = account.borrow<&NonFungibleToken.Collection>(from: path) {
            tokenIDs = collectionRef.getIDs()
          }
        }

        let isVault = type.isSubtype(of: vaultType) 
        var balance: UFix64? = nil
        if isVault {
          if let vaultRef = account.borrow<&FungibleToken.Vault>(from: path) {
            balance = vaultRef.balance
          }
        }

        let item = Item(
          address: address,
          path: path.toString(),
          type: type,
          isResource: isResource,
          isNFTCollection: isNFTCollection,
          tokenIDs: tokenIDs,
          isVault: isVault,
          balance: balance
        )

        items.append(item)
      }
    }

    return items
  }
  `

  const items = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(paths, t.Array(t.String))
    ]
  }) 

  return items
}

const getStoragePaths = async (address) => {
  const code = `
  pub fun main(address: Address): [StoragePath] {
    ${outdatedPaths(publicConfig.chainEnv).storage} 
    let account = getAuthAccount(address)
    let cleandPaths: [StoragePath] = []
    for path in account.storagePaths {
      if (outdatedPaths.containsKey(path)) {
        continue
      }

      cleandPaths.append(path)
    }
    return cleandPaths
  }
  `

  const paths = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  }) 

  return paths
}

export const getStoredStruct = async (address, path) => {
  const pathIdentifier = path.replace("/storage/", "")

  const code = `
  pub fun main(address: Address, pathStr: String): &AnyStruct? {
    let account = getAuthAccount(address)
    let path = StoragePath(identifier: pathStr)!
    return account.borrow<&AnyStruct>(from: path)
  }
  `

  const resource = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(pathIdentifier, t.String),
    ]
  }) 

  return resource
}


export const getStoredResource = async (address, path) => {
  const pathIdentifier = path.replace("/storage/", "")

  const code = `
  pub fun main(address: Address, pathStr: String): &AnyResource? {
    let account = getAuthAccount(address)
    let path = StoragePath(identifier: pathStr)!
    return account.borrow<&AnyResource>(from: path)
  }
  `

  const resource = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(pathIdentifier, t.String),
    ]
  }) 

  return resource
}


// --- Public Items ---

export const bulkGetPublicItems = async (address) => {
  const paths = await getPublicPaths(address)
  const groups = splitList(paths, 100)
  const promises = groups.map((group) => {
    return getPublicItems(address, group)
  })

  const itemGroups = await Promise.all(promises)
  const items = itemGroups.reduce((acc, curr) => {
    return acc.concat(curr)
  }, [])
  return items
}

export const getPublicItems = async (address, paths) => {
  const pathMap = paths.reduce((acc, path) => {
    const p = {key: `/${path.domain}/${path.identifier}`, value: true}
    acc.push(p)
    return acc
  }, [])

  const code = `
  import FungibleToken from 0xFungibleToken
  import NonFungibleToken from 0xNonFungibleToken
   
  pub struct Item {
      pub let address: Address
      pub let path: String
      pub let type: Type

      pub let targetPath: String?

      pub let isCollectionCap: Bool
      pub let tokenIDs: [UInt64]

      pub let isBalanceCap: Bool
      pub let balance: UFix64?
  
      init(
        address: Address, 
        path: String, 
        type: Type, 
        targetPath: String?, 
        isCollectionCap: Bool, 
        tokenIDs: [UInt64],
        isBalanceCap: Bool,
        balance: UFix64?
      ) {
          self.address = address
          self.path = path
          self.type = type
          self.targetPath = targetPath
          self.isCollectionCap = isCollectionCap
          self.tokenIDs = tokenIDs
          self.isBalanceCap = isBalanceCap
          self.balance = balance
      }
  }

  pub fun main(address: Address, pathMap: {String: Bool}): [Item] {
    let account = getAuthAccount(address)

    let items: [Item] = []
    let balanceCapType = Type<Capability<&AnyResource{FungibleToken.Balance}>>()
    let collectionType = Type<Capability<&AnyResource{NonFungibleToken.CollectionPublic}>>()

    account.forEachPublic(fun (path: PublicPath, type: Type): Bool {
      if !pathMap.containsKey(path.toString()) {
        return true
      }

      var targetPath: String? = nil
      var isCollectionCap = false
      var isBalanceCap = false
      var tokenIDs: [UInt64] = []
      var balance: UFix64? = nil

      if let target = account.getLinkTarget(path) {
        targetPath = target.toString()
      }

      if (type.isSubtype(of: balanceCapType)) {
        isBalanceCap = true
        let vaultRef = account
            .getCapability(path)
            .borrow<&{FungibleToken.Balance}>()

        if let vault = vaultRef {
            balance = vault.balance
        }
      } else if (type.isSubtype(of: collectionType)) {
        isCollectionCap = true
        let collectionRef = account
          .getCapability(path)
          .borrow<&{NonFungibleToken.CollectionPublic}>()

        if let collection = collectionRef {
          tokenIDs = collection.getIDs()
        }
      }

      let item = Item(
        address: address,
        path: path.toString(),
        type: type,
        targetPath: targetPath,
        isCollectionCap: isCollectionCap,
        tokenIDs: tokenIDs,
        isBalanceCap: isBalanceCap,
        balance: balance
      )

      items.append(item)
      return true
    })

    return items
  }
  `

  const items = await fcl.query({
    cadence: code,
    args: (arg, t) => [
        arg(address, t.Address),
        arg(pathMap, t.Dictionary({key: t.String, value: t.Bool}))
      ]
  }) 

  return items
}

export const getPublicPaths = async (address) => {
  const code = `
  pub fun main(address: Address): [PublicPath] {
    ${outdatedPaths(publicConfig.chainEnv).public} 
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
  `

  const paths = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  }) 

  return paths
}

// --- Private Items ---

export const bulkGetPrivateItems = async (address) => {
  const paths = await getPrivatePaths(address)
  const groups = splitList(paths, 100)
  const promises = groups.map((group) => {
    return getPrivateItems(address, group)
  })

  const itemGroups = await Promise.all(promises)
  const items = itemGroups.reduce((acc, curr) => {
    return acc.concat(curr)
  }, [])
  return items
}

export const getPrivateItems = async (address, paths) => {
  const pathMap = paths.reduce((acc, path) => {
    const p = {key: `/${path.domain}/${path.identifier}`, value: true}
    acc.push(p)
    return acc
  }, [])

  const code = `
  pub struct Item {
      pub let address: Address
      pub let path: String
      pub let type: Type
      pub let targetPath: String?

      init(
        address: Address, 
        path: String, 
        type: Type, 
        targetPath: String?
      ) {
        self.address = address
        self.path = path
        self.type = type
        self.targetPath = targetPath
      }
  }

  pub fun main(address: Address, pathMap: {String: Bool}): [Item] {
    let account = getAuthAccount(address)

    let items: [Item] = []
    account.forEachPrivate(fun (path: PrivatePath, type: Type): Bool {
      if !pathMap.containsKey(path.toString()) {
        return true
      }

      var targetPath: String? = nil
      if let target = account.getLinkTarget(path) {
        targetPath = target.toString()
      }

      let item = Item(
        address: address,
        path: path.toString(),
        type: type,
        targetPath: targetPath
      )

      items.append(item)
      return true
    })

    return items
  }
  `

  const items = await fcl.query({
    cadence: code,
    args: (arg, t) => [
        arg(address, t.Address),
        arg(pathMap, t.Dictionary({key: t.String, value: t.Bool}))
      ]
  }) 

  return items
}

export const getPrivatePaths = async (address) => {
  const code = `
  pub fun main(address: Address): [PrivatePath] {
    ${outdatedPaths(publicConfig.chainEnv).private} 
    let account = getAuthAccount(address)
    let cleandPaths: [PrivatePath] = []
    for path in account.privatePaths {
      if (outdatedPaths.containsKey(path)) {
        continue
      }

      cleandPaths.append(path)
    }
    return cleandPaths
  }
  `

  const paths = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  }) 

  return paths
}
