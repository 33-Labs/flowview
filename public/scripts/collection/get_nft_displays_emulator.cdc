import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews

pub struct ViewInfo {
  pub let name: String
  pub let description: String
  pub let thumbnail: AnyStruct{MetadataViews.File}
  pub let rarity: String?
  pub let transferrable: Bool
  pub let collectionDisplay: MetadataViews.NFTCollectionDisplay?

  init(name: String, description: String, thumbnail: AnyStruct{MetadataViews.File}, rarity: String?, transferrable: Bool, collectionDisplay: MetadataViews.NFTCollectionDisplay?) {
    self.name = name
    self.description = description
    self.thumbnail = thumbnail
    self.rarity = rarity
    self.transferrable = transferrable
    self.collectionDisplay = collectionDisplay
  }
}

pub fun main(address: Address, storagePathID: String, tokenIDs: [UInt64]): {UInt64: ViewInfo} {
  let account = getAuthAccount(address)
  let res: {UInt64: ViewInfo} = {}
  var collectionDisplayFetched = false

  if tokenIDs.length == 0 {
    return res
  }

  let path = StoragePath(identifier: storagePathID)!
  let type = account.type(at: path)
  if type == nil {
    return res
  }

  let metadataViewType = Type<@AnyResource{MetadataViews.ResolverCollection}>()

  let conformedMetadataViews = type!.isSubtype(of: metadataViewType)
  if !conformedMetadataViews {
    for tokenID in tokenIDs {
      res[tokenID] = ViewInfo(
        name: storagePathID,
        description: "",
        thumbnail: MetadataViews.HTTPFile(url: ""),
        rarity: nil,
        transferrable: true,
        collectionDisplay: nil
      )
    }
    return res
  }

  let collectionRef = account.borrow<&{MetadataViews.ResolverCollection, NonFungibleToken.CollectionPublic}>(from: path)
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
        transferrable: true,
        collectionDisplay: collectionDisplay
      )
    } else {
      res[tokenID] = ViewInfo(
        name: storagePathID,
        description: "",
        thumbnail: MetadataViews.HTTPFile(url: ""),
        rarity: nil,
        transferrable: true,
        collectionDisplay: nil
      )
    }
  }
  return res
}