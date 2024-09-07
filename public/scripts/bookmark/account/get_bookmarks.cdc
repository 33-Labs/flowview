import FlowviewAccountBookmark from 0xFlowviewAccountBookmark

access(all) fun main(owner: Address): &{Address: FlowviewAccountBookmark.AccountBookmark}? {
  let acct = getAuthAccount<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(owner)
  let collection = acct.storage.borrow<&FlowviewAccountBookmark.AccountBookmarkCollection>(from: FlowviewAccountBookmark.AccountBookmarkCollectionStoragePath)
    ?? panic("Could not borrow account bookmark collection")

  return collection.getAccountBookmarks()
}