import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"

const NFTCatalogPath = "0xNFTCatalog"
const NonFungibleTokenPath = "0xNonFungibleToken"
const FungibleTokenPath = "0xFungibleToken"
const MetadataViewsPath = "0xMetadataViews"
const FlowboxPath = "0xFlowbox"

const outdatedPaths = (network) => {
  if (network == "mainnet") {
    return outdatedPathsMainnet
  }
  return outdatedPathsTestnet
}

const outdatedPathsMainnet = {
  storage: `
  let outdatedPaths: {StoragePath: Bool} = {
    /storage/FantastecNFTCollection: true,
    /storage/FantastecNFTMinter: true,
    /storage/jambbLaunchCollectiblesCollection: true,
    /storage/jambbLaunchCollectiblesMinter: true,
    /storage/RacingTimeCollection: true,
    /storage/RacingTimeMinter: true,
    /storage/MusicBlockCollection: true,
    /storage/MusicBlockMinter: true,
    /storage/SupportUkraineCollectionV10: true,
    /storage/SupportUkraineMinterV10: true,
    /storage/DropzTokenCollection: true,
    /storage/DropzTokenAdmin: true,
    /storage/TokenLendingUserCertificate001: true,
    /storage/TokenLendingPlaceMinterProxy001: true,
    /storage/TokenLendingPlaceAdmin: true,
    /storage/TokenLendingPlace001: true,
    /storage/BnGNFTCollection: true,
    /storage/FuseCollectiveCollection: true,
    /storage/NFTLXKickCollection: true,
    /storage/NFTLXKickMinter: true
  }
  `,
  public: `
  let outdatedPaths: {PublicPath: Bool} = {
    /public/FantastecNFTCollection: true,
    /public/jambbLaunchCollectiblesCollection: true,
    /public/RacingTimeCollection: true,
    /public/MusicBlockCollection: true,
    /public/SupportUkraineCollectionV10: true,
    /public/DropzTokenCollection: true,
    /public/TokenLendingPlaceMinterProxy001: true,
    /public/TokenLendingPlace001: true,
    /public/BnGNFTCollection: true,
    /public/FuseCollectiveCollection: true,
    /public/NFTLXKickCollection: true
  }
  `,
  private: `
  let outdatedPaths: {PrivatePath: Bool} = {
    /private/MusicBlockCollectionProviderForNFTStorefront: true,
    /private/TokenLendingUserCertificate001: true,
    /private/BnGNFTMinter: true,
    /private/NFTLXKicksSneakerSets: true
  }
  `
}

const outdatedPathsTestnet = {
  storage: `
  let outdatedPaths: {StoragePath: Bool} = {
    /storage/kittyItemsCollectionV10: true
  }
  `,
  public: `
  let outdatedPaths: {PublicPath: Bool} = {
    /public/kittyItemsCollectionV10: true
  }
  `,
  private: `
  let outdatedPaths: {PrivatePath: Bool} = {
    /private/kittyItemsCollectionProviderV10: true
  }`
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
  .replace(FlowboxPath, publicConfig.flowboxAddress)

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
  .replace(FlowboxPath, publicConfig.flowboxAddress)

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

export const getNftDisplays = async (address, publicPathID, tokenIDs) => {
  const ids = tokenIDs.map((id) => `${id}`)
  const code = `
  import NonFungibleToken from 0xNonFungibleToken
  import MetadataViews from 0xMetadataViews

  pub fun main(address: Address, publicPathID: String, tokenIDs: [UInt64]): {UInt64: MetadataViews.Display?}{
    let account = getAuthAccount(address)
    let res: {UInt64: MetadataViews.Display?} = {}

    let path = PublicPath(identifier: publicPathID)!
    let collectionRef = account.getCapability<&{MetadataViews.ResolverCollection}>(path).borrow()
    if (collectionRef == nil) {
      for tokenID in tokenIDs {
        res[tokenID] = MetadataViews.Display(
          name: publicPathID,
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
          name: publicPathID,
          description: "",
          thumbnail: MetadataViews.HTTPFile(url: "")
        )
      }
    }
    return res
  }
  `
  .replace(NonFungibleTokenPath, publicConfig.nonFungibleTokenAddress)
  .replace(MetadataViewsPath, publicConfig.metadataViewsAddress)

  const displays = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(publicPathID, t.String),
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
    return getNftDisplays(address, collection.path.replace("/public/", ""), group)
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
  .replace(NFTCatalogPath, publicConfig.nftCatalogAddress)

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
  .replace(NFTCatalogPath, publicConfig.nftCatalogAddress)

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
      pub let isVault: Bool
  
      init(address: Address, path: String, type: Type, isResource: Bool, isNFTCollection: Bool, isVault: Bool) {
          self.address = address
          self.path = path
          self.type = type
          self.isResource = isResource
          self.isNFTCollection = isNFTCollection
          self.isVault = isVault
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
        let isVault = type.isSubtype(of: vaultType) 

        let item = Item(
          address: address,
          path: path.toString(),
          type: type,
          isResource: isResource,
          isNFTCollection: isNFTCollection,
          isVault: isVault
        )

        items.append(item)
      }
    }

    return items
  }
  `
  .replace(FungibleTokenPath, publicConfig.fungibleTokenAddress)
  .replace(NonFungibleTokenPath, publicConfig.nonFungibleTokenAddress)

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
  .replace(FungibleTokenPath, publicConfig.fungibleTokenAddress)
  .replace(NonFungibleTokenPath, publicConfig.nonFungibleTokenAddress)

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
