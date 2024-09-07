import FlowviewAccountBookmark from 0xFlowviewAccountBookmark

transaction(
  address: Address,
  note: String
) {
  let bookmarkCollection: auth(FlowviewAccountBookmark.Manage) &FlowviewAccountBookmark.AccountBookmarkCollection

  prepare(signer: auth(Storage, Capabilities) &Account) {
    if signer.storage.borrow<&FlowviewAccountBookmark.AccountBookmarkCollection>(from: FlowviewAccountBookmark.AccountBookmarkCollectionStoragePath) == nil {
      let collection <- FlowviewAccountBookmark.createEmptyCollection()
      signer.storage.save(<-collection, to: FlowviewAccountBookmark.AccountBookmarkCollectionStoragePath)
      
      let cap = signer.capabilities.storage.issue<&FlowviewAccountBookmark.AccountBookmarkCollection>(FlowviewAccountBookmark.AccountBookmarkCollectionStoragePath)
      signer.capabilities.publish(cap, at: FlowviewAccountBookmark.AccountBookmarkCollectionPublicPath)
    }

    self.bookmarkCollection = signer.storage
      .borrow<auth(FlowviewAccountBookmark.Manage) &FlowviewAccountBookmark.AccountBookmarkCollection>(from: FlowviewAccountBookmark.AccountBookmarkCollectionStoragePath)
      ?? panic("Could not borrow collection")
  }

  execute {
    if let bookmark = self.bookmarkCollection.borrowAccountBookmark(address: address) {
      bookmark.setNote(note: note)
    } else {
      self.bookmarkCollection.addAccountBookmark(address: address, note: note)
    }
  }
}