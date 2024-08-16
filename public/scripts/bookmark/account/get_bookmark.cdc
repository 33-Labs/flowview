import "FlowviewAccountBookmark"

access(all) fun main(owner: Address, target: Address): &FlowviewAccountBookmark.AccountBookmark? {
  let acct = getAuthAccount<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(owner)
  if let collection = acct.storage.borrow<&FlowviewAccountBookmark.AccountBookmarkCollection>(from: FlowviewAccountBookmark.AccountBookmarkCollectionStoragePath) {
    return collection.borrowPublicAccountBookmark(address: target)
  } 

  return nil
}