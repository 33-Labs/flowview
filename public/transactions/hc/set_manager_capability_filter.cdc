import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xCapabilityFilter

transaction(childAddress: Address, filterAddress: Address) {
    prepare(acct: AuthAccount) {
        let m = acct.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager not found")

        let filter = getAccount(filterAddress).getCapability<&{CapabilityFilter.Filter}>(CapabilityFilter.PublicPath)
        assert(filter.check(), message: "capability filter is not configured properly")

        m.setManagerCapabilityFilter(cap: filter, childAddress: childAddress)
    }
}