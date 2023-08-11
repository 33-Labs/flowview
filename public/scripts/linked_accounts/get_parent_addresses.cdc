import HybridCustody from 0xHybridCustody
import MetadataViews from 0xMetadataViews

pub struct OwnedAccountInfo {
  pub let display: MetadataViews.Display?
  pub let parentStatuses: {Address: Bool}
  pub let parentAddresses: [Address]
  pub let isOwnedAccountExists: Bool

  init(
    display: MetadataViews.Display?, 
    parentStatuses: {Address: Bool},
    parentAddresses: [Address],
    isOwnedAccountExists: Bool
  ) {
    self.display = display
    self.parentStatuses = parentStatuses
    self.parentAddresses = parentAddresses
    self.isOwnedAccountExists = isOwnedAccountExists
  }
}

pub fun main(child: Address): OwnedAccountInfo {
    let acct = getAuthAccount(child)
    let o = acct.borrow<&HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath)
    if let owned = o {
      let viewType = Type<MetadataViews.Display>()
      let display = owned.resolveView(viewType) as! MetadataViews.Display?
      return OwnedAccountInfo(
        display: display,
        parentStatuses: owned.getParentStatuses(),
        parentAddresses: owned.getParentAddresses(),
        isOwnedAccountExists: true
      )
    }

    return OwnedAccountInfo(
      display: nil,
      parentStatuses: {},
      parentAddresses: [],
      isOwnedAccountExists: false
    )
}