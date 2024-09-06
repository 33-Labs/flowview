import "MetadataViews"
import "ViewResolver"

import "HybridCustody"
import "CapabilityFilter"

transaction(childAddress: Address, filterAddress: Address?, filterPath: PublicPath?) {
    prepare(acct: auth(Storage, Capabilities, Inbox) &Account) {
        var filter: Capability<&{CapabilityFilter.Filter}>? = nil
        if filterAddress != nil && filterPath != nil {
            filter = getAccount(filterAddress!).capabilities.get<&{CapabilityFilter.Filter}>(filterPath!)
        }

        if acct.storage.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath) == nil {
            let m <- HybridCustody.createManager(filter: filter)
            acct.storage.save(<- m, to: HybridCustody.ManagerStoragePath)

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

        let inboxName = HybridCustody.getChildAccountIdentifier(acct.address)
        let cap = acct.inbox.claim<auth(HybridCustody.Child) &{HybridCustody.AccountPrivate, HybridCustody.AccountPublic, ViewResolver.ResolverCollection}>(inboxName, provider: childAddress)
            ?? panic("child account cap not found")

        let manager = acct.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager no found")

        manager.addAccount(cap: cap)
    }
}