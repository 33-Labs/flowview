import NFTStorefrontV2 from 0x4eb8a10cb9f87357
import NonFungibleToken from 0x1d7e57aa55817448
import HWGarageCardV2 from 0xd0bcefdf1e67ea85
import FTRegistry from 0x097bafa4e0b48eef

pub struct FTInfo {
    pub let symbol: String
    pub let icon: String?

    init(symbol: String, icon: String?) {
        self.symbol = symbol
        self.icon = icon
    }
}

pub struct Listings {
    pub let validItems: [Item]
    pub let invalidItems: [Item]

    init(validItems: [Item], invalidItems: [Item]) {
        self.validItems = validItems
        self.invalidItems = invalidItems
    }
}

pub struct Item {
    pub let listingResourceId: UInt64
    pub let details: NFTStorefrontV2.ListingDetails
    pub let isGhosted: Bool
    pub let isPurchased: Bool
    pub let isExpired: Bool
    pub let nft: &NonFungibleToken.NFT?
    pub let paymentTokenInfo: FTInfo?

    init(
        listingResourceId: UInt64,
        details: NFTStorefrontV2.ListingDetails, 
        isGhosted: Bool, 
        isPurchased: Bool,
        isExpired: Bool,
        nft: &NonFungibleToken.NFT?, 
        paymentTokenInfo: FTInfo?
    ) {
        self.listingResourceId = listingResourceId
        self.details = details
        self.isGhosted = isGhosted
        self.isPurchased = isPurchased
        self.isExpired = isExpired
        self.nft = nft
        self.paymentTokenInfo = paymentTokenInfo
    }
}

pub fun main(account: Address): Listings {
    let storefrontRef = getAccount(account)
        .getCapability<&NFTStorefrontV2.Storefront{NFTStorefrontV2.StorefrontPublic}>(
            NFTStorefrontV2.StorefrontPublicPath
        )
        .borrow()
        ?? panic("Could not borrow public storefront from address")
    
    let validItems: [Item] = []
    let invalidItems: [Item] = []
    let listingIds = storefrontRef.getListingIDs()
    for id in listingIds {
        let listing = storefrontRef.borrowListing(listingResourceID: id)
            ?? panic("No item with that ID")
    
        let details = listing.getDetails()
        // SEE: https://discord.com/channels/613813861610684416/1134479469457973318/1134714856277291088
        let isGhosted = !listing.hasListingBecomeGhosted()
        let isPurchased = details.purchased
        let isExpired = details.expiry <= UInt64(getCurrentBlock().timestamp)
        if (isPurchased || isExpired || isGhosted) {
            let item = Item(
                listingResourceId: id, 
                details: details, 
                isGhosted: isGhosted,
                isPurchased: isPurchased,
                isExpired: isExpired,
                nft: nil,
                paymentTokenInfo: nil
            )
            invalidItems.append(item)
            continue
        }

        let nft = listing.borrowNFT()
        if (nft == nil) {
            continue
        }

        var ftInfo: FTInfo? = nil
        let rawFtInfo = FTRegistry.getFTInfoByTypeIdentifier(details.salePaymentVaultType.identifier)
        if let _rawFtInfo = rawFtInfo {
            ftInfo = FTInfo(symbol: _rawFtInfo.alias, icon: _rawFtInfo.icon)
        }

        let item = Item(
            listingResourceId: id, 
            details: details, 
            isGhosted: isGhosted,
            isPurchased: isPurchased,
            isExpired: isExpired,
            nft: nft, 
            paymentTokenInfo: ftInfo
        )
        validItems.append(item)
    }

    return Listings(validItems: validItems, invalidItems: invalidItems)
}