import FlowviewAccountBookmark from 0xFlowviewAccountBookmark

pub fun main(owner: Address, target: Address): &FlowviewAccountBookmark.AccountBookmark{FlowviewAccountBookmark.AccountBookmarkPublic}? {
  let acct = getAuthAccount(owner)
  if let collection = acct.borrow<&FlowviewAccountBookmark.AccountBookmarkCollection>(from: FlowviewAccountBookmark.AccountBookmarkCollectionStoragePath) {
    return collection.borrowPublicAccountBookmark(address: target)
  } 

  return nil
}