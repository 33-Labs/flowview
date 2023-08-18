import MetadataViews from 0xMetadataViews
import HybridCustody from 0xHybridCustody

transaction(childAddress: Address) {
    prepare(acct: AuthAccount) {
        let inboxName = HybridCustody.getChildAccountIdentifier(acct.address)
        let cap = acct.inbox.claim<&HybridCustody.ChildAccount{HybridCustody.AccountPrivate, HybridCustody.AccountPublic, MetadataViews.Resolver}>(inboxName, provider: childAddress)
            ?? panic("child account cap not found")

        let manager = acct.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager no found")

        manager.addAccount(cap: cap)
    }

    execute {}
}