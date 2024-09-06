import HybridCustody from 0xHybridCustody
import MetadataViews from 0xMetadataViews
import CapabilityFactory from 0xCapabilityFactory
import CapabilityFilter from 0xCapabilityFilter

access(all) struct OwnedAccountInfo {
  access(all) let display: MetadataViews.Display?
  access(all) let parents: [ParentInfo]
  access(all) let owner: Address?
  access(all) let isOwnedAccountExists: Bool

  init(
    display: MetadataViews.Display?, 
    parents: [ParentInfo],
    owner: Address?,
    isOwnedAccountExists: Bool
  ) {
    self.display = display
    self.parents = parents
    self.owner = owner
    self.isOwnedAccountExists = isOwnedAccountExists
  }
}

access(all) struct ParentInfo {
  access(all) let address: Address
  access(all) let isClaimed: Bool
  access(all) let childAccount: ChildAccountInfo?

  init(
    address: Address,
    isClaimed: Bool,
    childAccount: ChildAccountInfo?
  ) {
    self.address = address
    self.isClaimed = isClaimed
    self.childAccount = childAccount
  }
}

access(all) struct ChildAccountInfo {
  access(all) let factory: &{CapabilityFactory.Getter}
  access(all) let filter: &{CapabilityFilter.Filter}

  init(
    factory: &{CapabilityFactory.Getter},
    filter: &{CapabilityFilter.Filter}
  ) {
    self.factory = factory
    self.filter = filter
  }
}

access(all) fun main(child: Address): OwnedAccountInfo {
    let acct = getAuthAccount<auth(Storage, Inbox, Capabilities) &Account>(child)
    let o = acct.storage.borrow<auth(HybridCustody.Owner) &HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath)
    if let owned = o {
      let viewType = Type<MetadataViews.Display>()
      let display = owned.resolveView(viewType) as! MetadataViews.Display?
      let parentAddresses = owned.getParentAddresses()
      let parents: [ParentInfo] = []
      for parent in parentAddresses {
        var childInfo: ChildAccountInfo? = nil
        if let child = owned.borrowChildAccount(parent: parent) {
            if let factory = child.getCapabilityFactoryManager() {
                if let filter = child.getCapabilityFilter() {
                    childInfo = ChildAccountInfo(factory: factory, filter: filter)
                }
            }
        }

        let isClaimed = owned.getRedeemedStatus(addr: parent) ?? false
        let p = ParentInfo(address: parent, isClaimed: isClaimed, childAccount: childInfo)

        parents.append(p)
      }

      return OwnedAccountInfo(
        display: display,
        parents: parents,
        owner: owned.getOwner(),
        isOwnedAccountExists: true
      )
    }

    return OwnedAccountInfo(
      display: nil,
      parents: [],
      owner: nil,
      isOwnedAccountExists: false
    )
}