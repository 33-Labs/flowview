import NFTStorefrontV2 from 0xNFTStorefrontV2

transaction(account: Address, listingResourceIds: [UInt64]) {
    let storefrontRef: &NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontPublic}

    prepare(acct: AuthAccount) {
        self.storefrontRef = getAccount(account)
            .getCapability<&NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontPublic}>(
                NFTStorefrontV2.StorefrontPublicPath
            )
            .borrow()
            ?? panic("Could not borrow public storefront from address")
    }

    execute {
        for id in listingResourceIds {
            self.storefrontRef.cleanupPurchasedListings(listingResourceID: id)
        }
    }
}