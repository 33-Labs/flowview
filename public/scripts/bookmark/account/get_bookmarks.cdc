import FlowviewAccountBookmark from 0xFlowviewAccountBookmark

pub fun main(owner: Address): &{Address: FlowviewAccountBookmark.AccountBookmark{FlowviewAccountBookmark.AccountBookmarkPublic}}? {
  let acct = getAuthAccount(owner)
  let collection = acct.borrow<&FlowviewAccountBookmark.AccountBookmarkCollection>(from: FlowviewAccountBookmark.AccountBookmarkCollectionStoragePath)
    ?? panic("Could not borrow account bookmark collection")

  return collection.getAccountBookmarks()
}