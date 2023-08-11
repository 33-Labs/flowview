import HybridCustody from 0xHybridCustody
import CapabilityFactory from 0xCapabilityFactory
import CapabilityFilter from 0xCapabilityFilter
import CapabilityDelegator from 0xCapabilityDelegator

transaction(parent: Address, factoryAddress: Address, filterAddress: Address) {
    prepare(acct: AuthAccount) {
        let owned = acct.borrow<&HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath)
            ?? panic("owned account not found")

        let factory = getAccount(factoryAddress).getCapability<&CapabilityFactory.Manager{CapabilityFactory.Getter}>(CapabilityFactory.PublicPath)
        assert(factory.check(), message: "factory address is not configured properly")

        let filter = getAccount(filterAddress).getCapability<&{CapabilityFilter.Filter}>(CapabilityFilter.PublicPath)
        assert(filter.check(), message: "capability filter is not configured properly")

        owned.publishToParent(parentAddress: parent, factory: factory, filter: filter)
    }
}