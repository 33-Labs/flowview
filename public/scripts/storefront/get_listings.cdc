import NFTStorefrontV2 from 0x4eb8a10cb9f87357
import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448
import FTRegistry from 0x097bafa4e0b48eef
import ViewResolver from 0x1d7e57aa55817448

access(all) struct FTInfo {
    access(all) let symbol: String
    access(all) let icon: String?

    init(symbol: String, icon: String?) {
        self.symbol = symbol
        self.icon = icon
    }
}

access(all) struct CollectionData {
  access(all) let storagePath: StoragePath
  access(all) let publicPath: PublicPath

  init(
    storagePath: StoragePath,
    publicPath: PublicPath,
  ) {
    self.storagePath = storagePath
    self.publicPath = publicPath
  }
}

access(all) struct Listings {
    access(all) let validItems: [Item]
    access(all) let invalidItems: [Item]

    init(validItems: [Item], invalidItems: [Item]) {
        self.validItems = validItems
        self.invalidItems = invalidItems
    }
}

access(all) struct Item {
    access(all) let listingResourceId: UInt64
    access(all) let details: NFTStorefrontV2.ListingDetails
    access(all) let isGhosted: Bool
    access(all) let isPurchased: Bool
    access(all) let isExpired: Bool
    access(all) let nft: &{NonFungibleToken.NFT}?
    access(all) let paymentTokenInfo: FTInfo?
    access(all) let conformMetadataViews: Bool
    access(all) let collectionData: AnyStruct?
    access(all) let display: AnyStruct?
    access(all) let rarity: AnyStruct?

    init(
        listingResourceId: UInt64,
        details: NFTStorefrontV2.ListingDetails, 
        isGhosted: Bool, 
        isPurchased: Bool,
        isExpired: Bool,
        nft: &{NonFungibleToken.NFT}?,
        paymentTokenInfo: FTInfo?,
        conformMetadataViews: Bool,
        collectionData: AnyStruct?,
        display: AnyStruct?,
        rarity: AnyStruct?
    ) {
        self.listingResourceId = listingResourceId
        self.details = details
        self.isGhosted = isGhosted
        self.isPurchased = isPurchased
        self.isExpired = isExpired
        self.nft = nft
        self.paymentTokenInfo = paymentTokenInfo
        self.conformMetadataViews = conformMetadataViews
        self.collectionData = collectionData
        self.display = display
        self.rarity = rarity
    }
}

access(all) fun main(account: Address): Listings {
    let storefrontRef = getAccount(account).capabilities.get<&{NFTStorefrontV2.StorefrontPublic}>(
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
                paymentTokenInfo: nil,
                conformMetadataViews: false,
                collectionData: nil,
                display: nil,
                rarity: nil
            )
            invalidItems.append(item)
            continue
        }

        let nft = listing.borrowNFT()
        if (nft == nil) {
            continue
        }

        let conformMetadataViews = nft!.getType().isSubtype(of: Type<@{ViewResolver.Resolver}>())
        if !conformMetadataViews {
            continue
        }

        let display: AnyStruct? = nft!.resolveView(Type<MetadataViews.Display>())
        let rarity: AnyStruct? = nft!.resolveView(Type<MetadataViews.Rarity>())
        let nftCollectionData: MetadataViews.NFTCollectionData? = nft!.resolveView(Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
        var collectionData: CollectionData? = nil
        if let data = nftCollectionData {
            collectionData = CollectionData(
                storagePath: data.storagePath,
                publicPath: data.publicPath
            )
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
            paymentTokenInfo: ftInfo,
            conformMetadataViews: conformMetadataViews,
            collectionData: collectionData,
            display: display,
            rarity: rarity
        )
        validItems.append(item)
    }

    return Listings(validItems: validItems, invalidItems: invalidItems)
}