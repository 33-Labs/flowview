#allowAccountLinking

import HybridCustody from 0xHybridCustody
import MetadataViews from 0xMetadataViews

transaction(childAddress: Address) {
    prepare(acct: AuthAccount) {
        let inboxName = HybridCustody.getOwnerIdentifier(acct.address) 
        let cap = acct.inbox.claim<&AnyResource{HybridCustody.OwnedAccountPrivate, HybridCustody.OwnedAccountPublic, MetadataViews.Resolver}>(inboxName, provider: childAddress)
            ?? panic("owned account cap not found")

        let manager = acct.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager no found")

        manager.addOwnedAccount(cap: cap)
    }

    execute {}
}