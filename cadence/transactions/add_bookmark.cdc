import FlowviewAccountBookmark from "../contracts/FlowviewAccountBookmark.cdc"

transaction(
  address: Address,
  note: String
) {
  let bookmarkCollection: &FlowviewAccountBookmark.AccountBookmarkCollection

  prepare(signer: AuthAccount) {
    if signer.borrow<&FlowviewAccountBookmark.AccountBookmarkCollection>(from: FlowviewAccountBookmark.AccountBookmarkCollectionStoragePath) == nil {
      let collection <- FlowviewAccountBookmark.createEmptyCollection()
      signer.save(<-collection, to: FlowviewAccountBookmark.AccountBookmarkCollectionStoragePath)
      
      let cap = signer.link<&FlowviewAccountBookmark.AccountBookmarkCollection{FlowviewAccountBookmark.CollectionPublic}>(
        FlowviewAccountBookmark.AccountBookmarkCollectionPublicPath, 
        target: FlowviewAccountBookmark.AccountBookmarkCollectionStoragePath
      ) ?? panic("Could not create public capability")
    }

    self.bookmarkCollection = signer.borrow<&FlowviewAccountBookmark.AccountBookmarkCollection>(from: FlowviewAccountBookmark.AccountBookmarkCollectionStoragePath)
      ?? panic("Could not borrow collection")
  }

  execute {
    self.bookmarkCollection.addAccountBookmark(address: address, note: note)
  }
}