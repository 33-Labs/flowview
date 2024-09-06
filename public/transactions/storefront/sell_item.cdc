import FlowToken from 0xFlowToken
import FungibleToken from 0xFungibleToken
import NonFungibleToken from 0xNonFungibleToken
import __NFT_CONTRACT_NAME__ from __NFT_CONTRACT_ADDRESS__
import MetadataViews from 0xMetadataViews
import NFTStorefrontV2 from 0xNFTStorefrontV2

transaction(saleItemID: UInt64, saleItemPrice: UFix64, days: UInt64) {
    let flowReceiver: Capability<&AnyResource{FungibleToken.Receiver}>
    let customID: String?
    let commissionAmount: UFix64
    let marketplacesAddress: [Address]

    let nftProvider: Capability<&AnyResource{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>
    let storefront: &NFTStorefrontV2.Storefront
    var saleCuts: [NFTStorefrontV2.SaleCut]
    var marketplacesCapability: [Capability<&AnyResource{FungibleToken.Receiver}>]

    prepare(acct: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account) {
        if acct.borrow<&NFTStorefrontV2.Storefront>(from: NFTStorefrontV2.StorefrontStoragePath) == nil {
            let storefront <- NFTStorefrontV2.createStorefront() as! @NFTStorefrontV2.Storefront
            acct.save(<-storefront, to: NFTStorefrontV2.StorefrontStoragePath)
            acct.link<&{NFTStorefrontV2.StorefrontPublic}>(NFTStorefrontV2.StorefrontPublicPath, target: NFTStorefrontV2.StorefrontStoragePath)
        }

        self.customID = "Flowview"
        self.commissionAmount = 0.0
        self.marketplacesAddress = []
        self.saleCuts = []
        self.marketplacesCapability = []

        // We need a provider capability, but one is not provided by default so we create one if needed.
        let nftCollectionProviderPrivatePath = /private/__NFT_CONTRACT_NAME__CollectionProviderForNFTStorefront

        // Receiver for the sale cut.
        self.flowReceiver = acct.getCapability<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)!
        assert(self.flowReceiver.borrow() != nil, message: "Missing or mis-typed FlowToken receiver")

        // Check if the Provider capability exists or not if `no` then create a new link for the same.
        if !acct.getCapability<&{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftCollectionProviderPrivatePath)!.check() {
            acct.link<&{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftCollectionProviderPrivatePath, target: __NFT_COLLECTION_STORAGE_PATH__)
        }

        self.nftProvider = acct.getCapability<&{NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}>(nftCollectionProviderPrivatePath)!
        let collection = acct
            .getCapability(__NFT_COLLECTION_PUBLIC_PATH__)
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not borrow a reference to the collection")
        var totalRoyaltyCut = 0.0
        let effectiveSaleItemPrice = saleItemPrice - self.commissionAmount
        let nft = collection.borrowNFT(id: saleItemID)
        // Check whether the NFT implements the MetadataResolver or not.
        if nft.getViews().contains(Type<MetadataViews.Royalties>()) {
            let royaltiesRef = nft.resolveView(Type<MetadataViews.Royalties>())?? panic("Unable to retrieve the royalties")
            let royalties = (royaltiesRef as! MetadataViews.Royalties).getRoyalties()
            for royalty in royalties {
                // TODO - Verify the type of the vault and it should exists
                self.saleCuts.append(NFTStorefrontV2.SaleCut(receiver: royalty.receiver, amount: royalty.cut * effectiveSaleItemPrice))
                totalRoyaltyCut = totalRoyaltyCut + royalty.cut * effectiveSaleItemPrice
            }
        }
        // Append the cut for the seller.
        self.saleCuts.append(NFTStorefrontV2.SaleCut(
            receiver: self.flowReceiver,
            amount: effectiveSaleItemPrice - totalRoyaltyCut
        ))
        assert(self.nftProvider.borrow() != nil, message: "Missing or mis-typed NFT Collection provider")

        self.storefront = acct.borrow<&NFTStorefrontV2.Storefront>(from: NFTStorefrontV2.StorefrontStoragePath)
            ?? panic("Missing or mis-typed NFTStorefront Storefront")

        for marketplace in self.marketplacesAddress {
            // Here we are making a fair assumption that all given addresses would have
            // the capability to receive the `FlowToken`
            self.marketplacesCapability.append(getAccount(marketplace).getCapability<&{FungibleToken.Receiver}>(/public/flowTokenReceiver))
        }
    }

    execute {
        // check for existing listings of the NFT
        var existingListingIDs = self.storefront.getExistingListingIDs(
            nftType: Type<@__NFT_CONTRACT_NAME__.NFT>(),
            nftID: saleItemID
        )
        // remove existing listings
        for listingID in existingListingIDs {
            self.storefront.removeListing(listingResourceID: listingID)
        }
        let expiry = UInt64(getCurrentBlock().timestamp) + days * 86400
        // Create listing
        self.storefront.createListing(
            nftProviderCapability: self.nftProvider,
            nftType: Type<@__NFT_CONTRACT_NAME__.NFT>(),
            nftID: saleItemID,
            salePaymentVaultType: Type<@FlowToken.Vault>(),
            saleCuts: self.saleCuts,
            marketplacesCapability: self.marketplacesCapability.length == 0 ? nil : self.marketplacesCapability,
            customID: self.customID,
            commissionAmount: self.commissionAmount,
            expiry: expiry
        )
    }
}