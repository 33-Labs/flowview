import ViewResolver from 0x1d7e57aa55817448
import FindViews from 0x097bafa4e0b48eef
import NonFungibleToken from 0x1d7e57aa55817448

access(all) fun main(address: Address, path: StoragePath, tokenId: UInt64): Bool {
    let account = getAuthAccount<auth(Storage) &Account>(address)
    let collectionRef = account.storage.borrow<&{ViewResolver.ResolverCollection, NonFungibleToken.CollectionPublic}>(from: path)
        ?? panic("Could not borrow a reference to the collection")

    let resolver = collectionRef.borrowViewResolver(id: tokenId)
        ?? panic("Could not borrow a reference to the view resolver")
        
    return FindViews.checkSoulBound(resolver)
}