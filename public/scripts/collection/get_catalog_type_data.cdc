import NFTCatalog from 0xNFTCatalog

access(all) fun main(): {String : {String : Bool}} {
  let catalog = NFTCatalog.getCatalogTypeData()
  return catalog
}