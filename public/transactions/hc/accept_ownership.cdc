#allowAccountLinking

import "HybridCustody"
import "CapabilityFilter"
import "ViewResolver"

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

            acct.capabilities.storage.issue<auth(HybridCustody.Manage) &{HybridCustody.ManagerPrivate, HybridCustody.ManagerPublic}>(HybridCustody.ManagerStoragePath)
            acct.capabilities.publish(
                acct.capabilities.storage.issue<&{HybridCustody.ManagerPublic}>(HybridCustody.ManagerStoragePath),
                at: HybridCustody.ManagerPublicPath
            )
        }

        let inboxName = HybridCustody.getOwnerIdentifier(acct.address) 
        let cap = acct.inbox.claim<auth(HybridCustody.Owner) &{HybridCustody.OwnedAccountPrivate, HybridCustody.OwnedAccountPublic, ViewResolver.ResolverCollection}>(inboxName, provider: childAddress)
            ?? panic("owned account cap not found")

        let manager = acct.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager no found")

        let ownedAcct = cap.borrow() ?? panic("could not borrow owned account capability")

        manager.addOwnedAccount(cap: cap)
    }
}