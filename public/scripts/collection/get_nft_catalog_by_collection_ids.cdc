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