import FlowToken from 0xFlowToken
import FungibleToken from 0xFungibleToken
import NonFungibleToken from 0xNonFungibleToken
import __NFT_CONTRACT_NAME__ from __NFT_CONTRACT_ADDRESS__
import MetadataViews from 0xMetadataViews
import NFTStorefrontV2 from 0xNFTStorefrontV2

transaction(saleItemID: UInt64, saleItemPrice: UFix64, days: UInt64) {
    let flowReceiver: Capability<&{FungibleToken.Receiver}>
    let customID: String?
    let commissionAmount: UFix64
    let marketplacesAddress: [Address]

    let nftProvider: Capability<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>
    let storefront: auth(NFTStorefrontV2.CreateListing, NFTStorefrontV2.RemoveListing) &NFTStorefrontV2.Storefront
    var saleCuts: [NFTStorefrontV2.SaleCut]
    var marketplacesCapability: [Capability<&{FungibleToken.Receiver}>]

    prepare(acct: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue) &Account) {
        if acct.storage.borrow<auth(NFTStorefrontV2.CreateListing) &NFTStorefrontV2.Storefront>(from: NFTStorefrontV2.StorefrontStoragePath) == nil {
            let storefront <- NFTStorefrontV2.createStorefront() as! @NFTStorefrontV2.Storefront
            acct.storage.save(<-storefront, to: NFTStorefrontV2.StorefrontStoragePath)
            let storefrontPublicCap = acct.capabilities.storage.issue<&{NFTStorefrontV2.StorefrontPublic}>(
                    NFTStorefrontV2.StorefrontStoragePath
                )
            acct.capabilities.publish(storefrontPublicCap, at: NFTStorefrontV2.StorefrontPublicPath)
        }

        self.storefront = acct.storage.borrow<auth(NFTStorefrontV2.CreateListing, NFTStorefrontV2.RemoveListing) &NFTStorefrontV2.Storefront>(
                from: NFTStorefrontV2.StorefrontStoragePath
            ) ?? panic("Missing or mis-typed NFTStorefront Storefront")

        // Receiver for the sale cut.
        self.flowReceiver = acct.capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)!
        assert(self.flowReceiver.borrow() != nil, message: "Missing or mis-typed FlowToken receiver")
        self.customID = "Flowview"
        self.commissionAmount = 0.0
        self.marketplacesAddress = []
        self.saleCuts = []
        self.marketplacesCapability = []

        let collectionData = __NFT_CONTRACT_NAME__.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
            ?? panic("ViewResolver does not resolve NFTCollectionData view")

        let collection = acct.capabilities.borrow<&{NonFungibleToken.Collection}>(
                collectionData.publicPath
            ) ?? panic("Could not borrow a reference to the signer's collection")

        self.nftProvider = acct.capabilities.storage.issue<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
                collectionData.storagePath
            )
        assert(self.nftProvider.check(), message: "Missing or mis-typed NFT provider")

        var totalRoyaltyCut = 0.0
        let effectiveSaleItemPrice = saleItemPrice - self.commissionAmount
        let nft = collection.borrowNFT(saleItemID)!
        // Check whether the NFT implements the MetadataResolver or not.

        if nft.getViews().contains(Type<MetadataViews.Royalties>()) {
            let royaltiesRef = nft.resolveView(Type<MetadataViews.Royalties>())?? panic("Unable to retrieve the royalties")
            let royalties = (royaltiesRef as! MetadataViews.Royalties).getRoyalties()
            for royalty in royalties {
                // TODO - Verify the type of the vault and it should exists
                self.saleCuts.append(
                    NFTStorefrontV2.SaleCut(
                        receiver: royalty.receiver,
                        amount: royalty.cut * effectiveSaleItemPrice
                    )
                )
                totalRoyaltyCut = totalRoyaltyCut + (royalty.cut * effectiveSaleItemPrice)
            }
        }
        // Append the cut for the seller.
        self.saleCuts.append(
            NFTStorefrontV2.SaleCut(
                receiver: self.flowReceiver,
                amount: effectiveSaleItemPrice - totalRoyaltyCut
            )
        )

        for marketplace in self.marketplacesAddress {
            // the capability to receive the `FlowToken`
            self.marketplacesCapability.append(getAccount(marketplace).capabilities.get<&{FungibleToken.Receiver}>(/public/flowTokenReceiver))
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