import NonFungibleToken from 0xNonFungibleToken

transaction(address: Address, tokenIds: [UInt64]) {

    let senderCollection: &NonFungibleToken.Collection
    let receiverCollection: Capability<&{NonFungibleToken.CollectionPublic}>

    prepare(account: AuthAccount) {
        self.senderCollection = account.borrow<&NonFungibleToken.Collection>(from: __NFT_STORAGE_PATH__)!

        let receiverAccount = getAccount(address)
        self.receiverCollection = receiverAccount.getCapability<&{NonFungibleToken.CollectionPublic}>(__NFT_PUBLIC_PATH__)
    }

    execute {
        for tokenId in tokenIds {
            let nft <- self.senderCollection.withdraw(withdrawID: tokenId)
            if(nft == nil){
                panic("NFT not found!")
            }
            self.receiverCollection.borrow()!.deposit(token: <-nft)
        }
    }
}