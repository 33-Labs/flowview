import NFTCatalog from 0xNFTCatalog

pub fun main(): {String : {String : Bool}} {
  let catalog = NFTCatalog.getCatalogTypeData()
  return catalog
}