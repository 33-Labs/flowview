#allowAccountLinking

import "MetadataViews"
import "ViewResolver"

import "HybridCustody"
import "CapabilityFactory"
import "CapabilityFilter"
import "CapabilityDelegator"

/// This transaction configures an OwnedAccount in the signer if needed, and proceeds to create a ChildAccount 
/// using CapabilityFactory.Manager and CapabilityFilter.Filter Capabilities from the given addresses. A
/// Capability on the ChildAccount is then published to the specified parent account. 
///
transaction(
    parent: Address,
    factoryAddress: Address,
    filterAddress: Address,
    name: String?,
    desc: String?,
    thumbnailURL: String?
) {
    prepare(acct: auth(Storage, Capabilities) &Account) {
        // Configure OwnedAccount if it doesn't exist
        if acct.storage.borrow<&HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath) == nil {
            var acctCap = acct.capabilities.account.issue<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>()
            let ownedAccount <- HybridCustody.createOwnedAccount(acct: acctCap)
            acct.storage.save(<-ownedAccount, to: HybridCustody.OwnedAccountStoragePath)
        }

        for c in acct.capabilities.storage.getControllers(forPath: HybridCustody.OwnedAccountStoragePath) {
            c.delete()
        }


        acct.capabilities.storage.issue<&{HybridCustody.BorrowableAccount, HybridCustody.OwnedAccountPublic, ViewResolver.Resolver}>(HybridCustody.OwnedAccountStoragePath)
        acct.capabilities.publish(
            acct.capabilities.storage.issue<&{HybridCustody.OwnedAccountPublic, ViewResolver.Resolver}>(HybridCustody.OwnedAccountStoragePath),
            at: HybridCustody.OwnedAccountPublicPath
        )

        let owned = acct.storage.borrow<auth(HybridCustody.Owner) &HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath)
            ?? panic("owned account not found")
        
        // Set the display metadata for the OwnedAccount
        if name != nil && desc != nil && thumbnailURL != nil {
            let thumbnail = MetadataViews.HTTPFile(url: thumbnailURL!)
            let display = MetadataViews.Display(name: name!, description: desc!, thumbnail: thumbnail)
            owned.setDisplay(display)
        }

        // Get CapabilityFactory & CapabilityFilter Capabilities
        let factory = getAccount(factoryAddress).capabilities.get<&CapabilityFactory.Manager>(CapabilityFactory.PublicPath)
        assert(factory.check(), message: "factory address is not configured properly")

        let filter = getAccount(filterAddress).capabilities.get<&{CapabilityFilter.Filter}>(CapabilityFilter.PublicPath)
        assert(filter.check(), message: "capability filter is not configured properly")

        // Finally publish a ChildAccount capability on the signing account to the specified parent
        owned.publishToParent(parentAddress: parent, factory: factory, filter: filter)
    }
}