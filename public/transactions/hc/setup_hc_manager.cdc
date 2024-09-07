import HybridCustody from 0xHybridCustody
import CapabilityFilter from 0xCapabilityFilter

transaction(filterAddress: Address?, filterPath: PublicPath?) {
    prepare(acct: auth(Storage, Capabilities) &Account) {
        var filter: Capability<&{CapabilityFilter.Filter}>? = nil
        if filterAddress != nil && filterPath != nil {
            filter = getAccount(filterAddress!).capabilities.get<&{CapabilityFilter.Filter}>(filterPath!)
        }

        if acct.storage.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath) == nil {
            let m <- HybridCustody.createManager(filter: filter)
            acct.storage.save(<- m, to: HybridCustody.ManagerStoragePath)
        }
        
        for c in acct.capabilities.storage.getControllers(forPath: HybridCustody.ManagerStoragePath) {
            c.delete()
        }

        acct.capabilities.unpublish(HybridCustody.ManagerPublicPath)

        acct.capabilities.publish(
            acct.capabilities.storage.issue<&{HybridCustody.ManagerPublic}>(HybridCustody.ManagerStoragePath),
            at: HybridCustody.ManagerPublicPath
        )

        acct.capabilities.storage.issue<auth(HybridCustody.Manage) &{HybridCustody.ManagerPrivate, HybridCustody.ManagerPublic}>(HybridCustody.ManagerStoragePath)
    }
}
 