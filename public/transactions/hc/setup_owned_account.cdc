#allowAccountLinking

import MetadataViews from 0xMetadataViews

import HybridCustody from 0xHybridCustody

/// This transaction configures an OwnedAccount in the signer if needed and configures its Capabilities per
/// HybridCustody's intended design. If Display values are specified (as recommended), they will be set on the
/// signer's OwnedAccount.
///
transaction(name: String?, desc: String?, thumbnailURL: String?) {
    prepare(acct: AuthAccount) {
        var acctCap = acct.getCapability<&AuthAccount>(HybridCustody.LinkedAccountPrivatePath)
        if !acctCap.check() {
            acctCap = acct.linkAccount(HybridCustody.LinkedAccountPrivatePath)!
        }

        if acct.borrow<&HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath) == nil {
            let ownedAccount <- HybridCustody.createOwnedAccount(acct: acctCap)
            acct.save(<-ownedAccount, to: HybridCustody.OwnedAccountStoragePath)
        }

        let owned = acct.borrow<&HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath)
            ?? panic("owned account not found")
        
        // Set the display metadata for the OwnedAccount
        if name != nil && desc != nil && thumbnailURL != nil {
            let thumbnail = MetadataViews.HTTPFile(url: thumbnailURL!)
            let display = MetadataViews.Display(name: name!, description: desc!, thumbnail: thumbnail!)
            owned.setDisplay(display)
        }

        // check that paths are all configured properly
        acct.unlink(HybridCustody.OwnedAccountPrivatePath)
        acct.link<&HybridCustody.OwnedAccount{HybridCustody.BorrowableAccount, HybridCustody.OwnedAccountPublic, MetadataViews.Resolver}>(HybridCustody.OwnedAccountPrivatePath, target: HybridCustody.OwnedAccountStoragePath)

        acct.unlink(HybridCustody.OwnedAccountPublicPath)
        acct.link<&HybridCustody.OwnedAccount{HybridCustody.OwnedAccountPublic, MetadataViews.Resolver}>(HybridCustody.OwnedAccountPublicPath, target: HybridCustody.OwnedAccountStoragePath)
    }
}
 