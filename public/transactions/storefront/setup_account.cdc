import NFTStorefrontV2 from 0xNFTStorefrontV2

// This transaction installs the Storefront ressource in an account.

transaction {
    prepare(acct: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account) {

        // If the account doesn't already have a Storefront
        if acct.borrow<&NFTStorefrontV2.Storefront>(from: NFTStorefrontV2.StorefrontStoragePath) == nil {

            // Create a new empty Storefront
            let storefront <- NFTStorefrontV2.createStorefront() as! @NFTStorefrontV2.Storefront
            
            // save it to the account
            acct.save(<-storefront, to: NFTStorefrontV2.StorefrontStoragePath)

            // create a public capability for the Storefront
            acct.link<&{NFTStorefrontV2.StorefrontPublic}>(NFTStorefrontV2.StorefrontPublicPath, target: NFTStorefrontV2.StorefrontStoragePath)
        }
    }
}