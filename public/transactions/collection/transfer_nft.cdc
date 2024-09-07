import NonFungibleToken from 0xNonFungibleToken

transaction(address: Address, tokenId: UInt64) {

    let senderCollection: auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}
    let receiverCollection: Capability<&{NonFungibleToken.CollectionPublic}>

    prepare(account: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account) {
        self.senderCollection = account.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(from: __NFT_STORAGE_PATH__)!

        let receiverAccount = getAccount(address)
        self.receiverCollection = receiverAccount.capabilities.get<&{NonFungibleToken.Collection}>(__NFT_PUBLIC_PATH__)
    }

    execute {
        let nft <- self.senderCollection.withdraw(withdrawID: tokenId)
        if(nft == nil){
            panic("NFT not found!")
        }
        self.receiverCollection.borrow()!.deposit(token: <-nft)
    }
}