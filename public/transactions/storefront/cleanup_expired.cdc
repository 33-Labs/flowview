import NFTStorefrontV2 from 0xNFTStorefrontV2

transaction(account: Address, from: UInt64, to: UInt64) {
    let storefrontRef: &{NFTStorefrontV2.StorefrontPublic}

    prepare(acct: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account) {
        self.storefrontRef = getAccount(account).capabilities.get<&{NFTStorefrontV2.StorefrontPublic}>(
                NFTStorefrontV2.StorefrontPublicPath
            )
            .borrow()
            ?? panic("Could not borrow public storefront from address")
    }

    execute {
        self.storefrontRef.cleanupExpiredListings(fromIndex: from, toIndex: to)
    }
}