import HybridCustody from 0xHybridCustody
import MetadataViews from 0xMetadataViews

pub struct ChildAccountInfo {
  pub let address: Address
  pub let display: MetadataViews.Display?

  init(
    address: Address,
    display: MetadataViews.Display?
  ) {
    self.address = address
    self.display = display
  }
}

pub struct ManagerInfo {
  pub let childAccounts: [ChildAccountInfo]
  pub let ownedAccounts: [ChildAccountInfo]
  pub let isManagerExists: Bool

  init(
    childAccounts: [ChildAccountInfo],
    ownedAccounts: [ChildAccountInfo],
    isManagerExists: Bool
  ) {
    self.childAccounts = childAccounts
    self.ownedAccounts = ownedAccounts
    self.isManagerExists = isManagerExists
  }
}

pub fun main(child: Address): ManagerInfo {
    let acct = getAuthAccount(child)
    let m = acct.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
    
    if let manager = m {
      return ManagerInfo(
        childAccounts: getChildAccounts(manager: manager),
        ownedAccounts: getOwnedAccounts(manager: manager),
        isManagerExists: true
      )
    }

    return ManagerInfo(
      childAccounts: [],
      ownedAccounts: [],
      isManagerExists: false
    )
}

pub fun getChildAccounts(manager: &HybridCustody.Manager): [ChildAccountInfo] {
  let childAddresses = manager.getChildAddresses()
  let children: [ChildAccountInfo] = []
  for childAddress in childAddresses {
    let display = manager.getChildAccountDisplay(address: childAddress)
    let child = ChildAccountInfo(address: childAddress, display: display)
    children.append(child)
  }

  return children
}

pub fun getOwnedAccounts(manager: &HybridCustody.Manager): [ChildAccountInfo] {
  let ownedAddresses = manager.getOwnedAddresses()
  let children: [ChildAccountInfo] = []
  for ownedAddress in ownedAddresses {
    if let o = manager.borrowOwnedAccount(addr: ownedAddress) {
      let d = o.resolveView(Type<MetadataViews.Display>()) as? MetadataViews.Display? 
      if let display = d {
        let child = ChildAccountInfo(address: ownedAddress, display: display)
        children.append(child)
      }
    } else {
      children.append(ChildAccountInfo(address: ownedAddress, display: nil))
    }
  }
  return children
}