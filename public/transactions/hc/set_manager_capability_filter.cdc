import "HybridCustody"
import "CapabilityFilter"

transaction(childAddress: Address, filterAddress: Address) {
    prepare(acct: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account) {
        let m = acct.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager not found")

        let filter = getAccount(filterAddress).capabilities.get<&{CapabilityFilter.Filter}>(CapabilityFilter.PublicPath)
        assert(filter.check(), message: "capability filter is not configured properly")

        m.setManagerCapabilityFilter(cap: filter, childAddress: childAddress)
    }
}