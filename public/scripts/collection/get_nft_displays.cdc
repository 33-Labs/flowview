import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews
import FindViews from 0xFindViews
import Flowmap from 0xFlowmap

access(all) struct ViewInfo {
  access(all) let name: String
  access(all) let description: String
  access(all) let thumbnail: AnyStruct{MetadataViews.File}
  access(all) let rarity: String?
  access(all) let transferrable: Bool
  access(all) let collectionDisplay: MetadataViews.NFTCollectionDisplay?
  access(all) let inscription: String

  init(name: String, description: String, thumbnail: AnyStruct{MetadataViews.File}, rarity: String?, transferrable: Bool, collectionDisplay: MetadataViews.NFTCollectionDisplay?, inscription: String) {
    self.name = name
    self.description = description
    self.thumbnail = thumbnail
    self.rarity = rarity
    self.transferrable = transferrable
    self.collectionDisplay = collectionDisplay
    self.inscription = inscription
  }
}

access(all) fun main(address: Address, storagePathID: String, tokenIDs: [UInt64]): {UInt64: ViewInfo} {
  let account = getAuthAccount<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(address)
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
      var inscription = ""
      if storagePathID == "flowmapCollection" {
        let collectionRef = account.borrow<&{Flowmap.CollectionPublic}>(from: path)
        if let c = collectionRef {
          if let nft = c.borrowFlowmap(id: tokenID) {
            inscription = nft.inscription
          }
        }
      }
      res[tokenID] = ViewInfo(
        name: storagePathID,
        description: "",
        thumbnail: MetadataViews.HTTPFile(url: ""),
        rarity: nil,
        transferrable: true,
        collectionDisplay: nil,
        inscription: inscription
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
      let transferrable = !FindViews.checkSoulBound(resolver)

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
        transferrable: transferrable,
        collectionDisplay: collectionDisplay,
        inscription: ""
      )
    } else {
      res[tokenID] = ViewInfo(
        name: storagePathID,
        description: "",
        thumbnail: MetadataViews.HTTPFile(url: ""),
        rarity: nil,
        transferrable: true,
        collectionDisplay: nil,
        inscription: ""
      )
    }
  }
  return res
}