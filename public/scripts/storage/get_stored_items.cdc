import FungibleToken from 0xFungibleToken
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews

pub struct CollectionDisplay {
  pub let name: String
  pub let squareImage: MetadataViews.Media

  init(name: String, squareImage: MetadataViews.Media) {
    self.name = name
    self.squareImage = squareImage
  }
}

pub struct CollectionData {
    pub let publicPath: PublicPath
    pub let storagePath: StoragePath

    init(publicPath: PublicPath, storagePath: StoragePath) {
      self.publicPath = publicPath
      self.storagePath = storagePath
    }
}

pub struct Item {
  pub let address: Address
  pub let path: String
  pub let type: Type
  pub let isResource: Bool
  pub let isNFTCollection: Bool
  pub let display: CollectionDisplay?
  pub let collectionData: CollectionData?
  pub let tokenIDs: [UInt64]
  pub let isVault: Bool
  pub let balance: UFix64?

  init(address: Address, path: String, type: Type, isResource: Bool, 
    isNFTCollection: Bool, display: CollectionDisplay?, collectionData: CollectionData?,
    tokenIDs: [UInt64], isVault: Bool, balance: UFix64?) {
      self.address = address
      self.path = path
      self.type = type
      self.isResource = isResource
      self.isNFTCollection = isNFTCollection
      self.display = display
      self.collectionData = collectionData
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
  let metadataViewType = Type<@AnyResource{MetadataViews.ResolverCollection}>()
  let items: [Item] = []

  for identifier in pathIdentifiers {
    let path = StoragePath(identifier: identifier)!

    if let type = account.type(at: path) {
      let isResource = type.isSubtype(of: resourceType)
      let isNFTCollection = type.isSubtype(of: collectionType)
      let conformedMetadataViews = type.isSubtype(of: metadataViewType)

      var tokenIDs: [UInt64] = []
      var collectionDisplay: CollectionDisplay? = nil
      var collectionData: CollectionData? = nil
      if isNFTCollection && conformedMetadataViews {
        if let collectionRef = account.borrow<&{MetadataViews.ResolverCollection, NonFungibleToken.CollectionPublic}>(from: path) {
          tokenIDs = collectionRef.getIDs()

          // TODO: move to a list
          if tokenIDs.length > 0 
          && path != /storage/RaribleNFTCollection 
          && path != /storage/ARTIFACTPackV3Collection
          && path != /storage/ARTIFACTV2Collection
          && path != /storage/ArleeScene {
            let resolver = collectionRef.borrowViewResolver(id: tokenIDs[0]) 
            if let display = MetadataViews.getNFTCollectionDisplay(resolver) {
              collectionDisplay = CollectionDisplay(
                name: display.name,
                squareImage: display.squareImage
              )
            } 
            if let data = MetadataViews.getNFTCollectionData(resolver) {
                collectionData = CollectionData(
                  publicPath: data.publicPath,
                  storagePath: data.storagePath
                )
            }
          }
        }
      } else if isNFTCollection {
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
        display: collectionDisplay,
        collectionData: collectionData,
        tokenIDs: tokenIDs,
        isVault: isVault,
        balance: balance
      )

      items.append(item)
    }
  }

  return items
}