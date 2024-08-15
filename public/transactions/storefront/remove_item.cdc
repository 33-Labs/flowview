import NFTStorefrontV2 from 0xNFTStorefrontV2

/// Transaction to facilitate the removal of listing by the
/// listing owner.
/// Listing owner should provide the `listingResourceID` that
/// needs to be removed.

transaction(listingResourceID: UInt64) {
    let storefront: &NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontManager}

    prepare(acct: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account) {
        self.storefront = acct.borrow<&NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontManager}>(from: NFTStorefrontV2.StorefrontStoragePath)
            ?? panic("Missing or mis-typed NFTStorefrontV2.Storefront")
    }

    execute {
        self.storefront.removeListing(listingResourceID: listingResourceID)
    }
}