import FlowviewAccountBookmark from "../contracts/FlowviewAccountBookmark.cdc"

access(all) fun main(owner: Address): &{Address: FlowviewAccountBookmark.AccountBookmark} {
  let acct = getAuthAccount<auth(Storage) &Account>(owner)
  let collection = acct.storage
    .borrow<&FlowviewAccountBookmark.AccountBookmarkCollection>(from: FlowviewAccountBookmark.AccountBookmarkCollectionStoragePath)
    ?? panic("Could not borrow AccountBookmarkCollection")

  return collection.getAccountBookmarks()
}