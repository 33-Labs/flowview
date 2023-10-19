import NonFungibleToken from 0xNonFungibleToken

transaction(recipients: [Address], tokenIds: [UInt64]) {

    let senderCollection: &NonFungibleToken.Collection

    prepare(account: AuthAccount) {
        assert(recipients.length == tokenIds.length, message: "invalid input")
        self.senderCollection = account.borrow<&NonFungibleToken.Collection>(from: __NFT_STORAGE_PATH__)!
    }

    execute {
        for index, tokenId in tokenIds {
            let recipient = recipients[index]!
            let recipientAccount = getAccount(recipient)
            let recipientCollection = recipientAccount.getCapability<&{NonFungibleToken.CollectionPublic}>(__NFT_PUBLIC_PATH__).borrow()
                ?? panic("Could not borrow capability from recipient")

            let nft <- self.senderCollection.withdraw(withdrawID: tokenId)
            if(nft == nil){
                panic("NFT not found!")
            }
            recipientCollection.deposit(token: <-nft)
        }
    }
}