import HybridCustody from 0xHybridCustody
import MetadataViews from 0xMetadataViews
import CapabilityFactory from 0xCapabilityFactory
import CapabilityFilter from 0xCapabilityFilter

access(all) struct ChildAccountInfo {
  access(all) let address: Address
  access(all) let display: MetadataViews.Display?
  access(all) let factorySupportedTypes: [Type]?
  access(all) let filterDetails: AnyStruct?
  access(all) let managerFilterDetails: AnyStruct?

  init(
    address: Address,
    display: MetadataViews.Display?,
    factorySupportedTypes: [Type]?,
    filterDetails: AnyStruct?,
    managerFilterDetails: AnyStruct?
  ) {
    self.address = address
    self.display = display
    self.factorySupportedTypes = factorySupportedTypes
    self.filterDetails = filterDetails
    self.managerFilterDetails = managerFilterDetails
  }
}

access(all) struct ManagerInfo {
  access(all) let childAccounts: [ChildAccountInfo]
  access(all) let ownedAccounts: [ChildAccountInfo]
  access(all) let isManagerExists: Bool

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

access(all) fun main(child: Address): ManagerInfo {
    let acct = getAuthAccount<auth(Storage) &Account>(child)
    let m = acct.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
    
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

access(all) fun getChildAccounts(manager: auth(HybridCustody.Manage) &HybridCustody.Manager): [ChildAccountInfo] {
  let childAddresses = manager.getChildAddresses()
  let children: [ChildAccountInfo] = []
  for childAddress in childAddresses {
    let display = manager.getChildAccountDisplay(address: childAddress)
    var factorySupportedTypes: [Type]? = nil
    var filterDetails: AnyStruct? = nil
    var managerFilterDetails: AnyStruct? = nil
    if let acct = manager.borrowAccount(addr: childAddress) {
      if let factory = acct.getCapabilityFactoryManager() {
        factorySupportedTypes = factory.getSupportedTypes()
      }
      if let filter = acct.getCapabilityFilter() {
        filterDetails = filter.getDetails()
      }
      if let mFilter = acct.getManagerCapabilityFilter() {
        managerFilterDetails = mFilter.getDetails()
      }
    }
    let child = ChildAccountInfo(address: childAddress, display: display, factorySupportedTypes: factorySupportedTypes, filterDetails: filterDetails, managerFilterDetails: managerFilterDetails)
    children.append(child)
  }

  return children
}

access(all) fun getOwnedAccounts(manager: auth(HybridCustody.Manage) &HybridCustody.Manager): [ChildAccountInfo] {
  let ownedAddresses = manager.getOwnedAddresses()
  let children: [ChildAccountInfo] = []
  for ownedAddress in ownedAddresses {
    if let o = manager.borrowOwnedAccount(addr: ownedAddress) {
      let d = o.resolveView(Type<MetadataViews.Display>()) as? MetadataViews.Display? 
      if let display = d {
        let child = ChildAccountInfo(address: ownedAddress, display: display, factorySupportedTypes: nil, filterDetails: nil, managerFilterDetails: nil)
        children.append(child)
      }
    } else {
      children.append(ChildAccountInfo(address: ownedAddress, display: nil, factorySupportedTypes: nil, filterDetails: nil, managerFilterDetails: nil))
    }
  }
  return children
}