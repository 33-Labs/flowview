import NFTStorefrontV2 from 0x4eb8a10cb9f87357
import NonFungibleToken from 0x1d7e57aa55817448
import __NFT_CONTRACT_NAME__ from __NFT_CONTRACT_ADDRESS__
import FTRegistry from 0x097bafa4e0b48eef
import FlowToken from 0x1654653399040a61

access(all) struct Item {
    access(all) let listingResourceId: UInt64
    access(all) let details: NFTStorefrontV2.ListingDetails
    access(all) let isGhosted: Bool
    access(all) let isPurchased: Bool
    access(all) let isExpired: Bool

    init(
        listingResourceId: UInt64,
        details: NFTStorefrontV2.ListingDetails, 
        isGhosted: Bool, 
        isPurchased: Bool,
        isExpired: Bool
    ) {
        self.listingResourceId = listingResourceId
        self.details = details
        self.isGhosted = isGhosted
        self.isPurchased = isPurchased
        self.isExpired = isExpired
    }
}

// FlowToken only
access(all) fun main(account: Address, nftID: UInt64): [Item] {
    let storefrontRef = getAccount(account)
        .getCapability<&NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontPublic}>(
            NFTStorefrontV2.StorefrontPublicPath
        )
        .borrow()
        ?? panic("Could not borrow public storefront from address")
    
    let items: [Item] = []
    let nftType = Type<@__NFT_CONTRACT_NAME__.NFT>()
    let listingIds = storefrontRef.getExistingListingIDs(nftType: nftType, nftID: nftID)
    for id in listingIds {
        let listing = storefrontRef.borrowListing(listingResourceID: id)
            ?? panic("No item with that ID")
    
        let details = listing.getDetails()
        // SEE: https://discord.com/channels/613813861610684416/1134479469457973318/1134714856277291088
        let isGhosted = !listing.hasListingBecomeGhosted()
        let isPurchased = details.purchased
        let isExpired = details.expiry <= UInt64(getCurrentBlock().timestamp)
        if (isPurchased || isExpired || isGhosted) {
            continue
        }

        if (details.salePaymentVaultType != Type<@FlowToken.Vault>()) {
            continue
        }

        let nft = listing.borrowNFT()
        if (nft == nil) {
            continue
        }

        let item = Item(
            listingResourceId: id,
            details: details,
            isGhosted: isGhosted,
            isPurchased: isPurchased,
            isExpired: isExpired
        )
        items.append(item)
    }

    return items
}