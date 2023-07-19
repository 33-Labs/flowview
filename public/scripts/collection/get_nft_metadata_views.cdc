import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews

pub struct CollectionData {
  pub let storagePath: StoragePath
  pub let publicPath: PublicPath
  pub let providerPath: PrivatePath
  pub let publicCollection: Type
  pub let publicLinkedType: Type
  pub let providerLinkedType: Type

  init(
    storagePath: StoragePath,
    publicPath: PublicPath,
    providerPath: PrivatePath,
    publicCollection: Type,
    publicLinkedType: Type,
    providerLinkedType: Type
  ) {
    self.storagePath = storagePath
    self.publicPath = publicPath
    self.providerPath = providerPath
    self.publicCollection = publicCollection
    self.publicLinkedType = publicLinkedType
    self.providerLinkedType = providerLinkedType
  }
}

pub fun main(address: Address, storagePathID: String, tokenID: UInt64): {String: AnyStruct} {
  let account = getAuthAccount(address)
  let res: {String: AnyStruct} = {}

  let path = StoragePath(identifier: storagePathID)!
  let collectionRef = account.borrow<&{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(from: path)
  if collectionRef == nil {
    panic("Get Collection Failed")
  }

  let type = account.type(at: path)
  if type == nil {
    return res
  }

  let metadataViewType = Type<@AnyResource{MetadataViews.ResolverCollection}>()
  let conformedMetadataViews = type!.isSubtype(of: metadataViewType)

  if (!conformedMetadataViews) {
    return res
  }

  collectionRef!.borrowNFT(id: tokenID)

  let resolver = collectionRef!.borrowViewResolver(id: tokenID)
  if let rarity = MetadataViews.getRarity(resolver) {
    res["rarity"] = rarity
  }

  if let display = MetadataViews.getDisplay(resolver) {
    res["display"] = display
  }

  if let editions = MetadataViews.getEditions(resolver) {
    res["editions"] = editions
  }

  if let serial = MetadataViews.getSerial(resolver) {
    res["serial"] = serial
  }

  if let royalties = MetadataViews.getRoyalties(resolver) {
    res["royalties"] = royalties
  }

  if let license = MetadataViews.getLicense(resolver) {
    res["license"] = license
  }

  if let medias = MetadataViews.getMedias(resolver) {
    res["medias"] = medias
  }

  if let externalURL = MetadataViews.getExternalURL(resolver) {
    res["externalURL"] = externalURL
  }

  if let traits = MetadataViews.getTraits(resolver) {
    res["traits"] = traits
  }

  if let collectionDisplay = MetadataViews.getNFTCollectionDisplay(resolver) {
    res["collectionDisplay"] = collectionDisplay
  }

  if let collectionData = MetadataViews.getNFTCollectionData(resolver) {
    let data = CollectionData(
      storagePath: collectionData.storagePath,
      publicPath: collectionData.publicPath,
      providerPath: collectionData.providerPath,
      publicCollection: collectionData.publicCollection,
      publicLinkedType: collectionData.publicLinkedType,
      providerLinkedType: collectionData.providerLinkedType
    )
    res["collectionData"] = data
  }

  res["tokenId"] = tokenID

  return res
}