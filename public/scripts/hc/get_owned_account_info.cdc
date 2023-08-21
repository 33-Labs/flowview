import HybridCustody from 0xHybridCustody
import MetadataViews from 0xMetadataViews
import CapabilityFactory from 0xCapabilityFactory
import CapabilityFilter from 0xCapabilityFilter

pub struct OwnedAccountInfo {
  pub let display: MetadataViews.Display?
  pub let parents: [ParentInfo]
  pub let owner: Address?
  pub let isOwnedAccountExists: Bool

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

pub struct ParentInfo {
  pub let address: Address
  pub let isClaimed: Bool
  pub let childAccount: ChildAccountInfo?

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

pub struct ChildAccountInfo {
  pub let factory: Capability<&CapabilityFactory.Manager{CapabilityFactory.Getter}>
  pub let filter: Capability<&{CapabilityFilter.Filter}>

  init(
    factory: Capability<&CapabilityFactory.Manager{CapabilityFactory.Getter}>,
    filter: Capability<&{CapabilityFilter.Filter}>
  ) {
    self.factory = factory
    self.filter = filter
  }
}

pub fun main(child: Address): OwnedAccountInfo {
    let acct = getAuthAccount(child)
    let o = acct.borrow<&HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath)
    if let owned = o {
      let viewType = Type<MetadataViews.Display>()
      let display = owned.resolveView(viewType) as! MetadataViews.Display?
      let parentAddresses = owned.getParentAddresses()
      let parents: [ParentInfo] = []
      for parent in parentAddresses {
        var childInfo: ChildAccountInfo? = nil
        if let child = owned.borrowChildAccount(parent: parent) {
          childInfo = ChildAccountInfo(factory: child.factory, filter: child.filter)
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