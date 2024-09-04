import "NonFungibleToken"

transaction(recipients: [Address], tokenIds: [UInt64]) {

    let senderCollection: auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}

    prepare(account: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account) {
        assert(recipients.length == tokenIds.length, message: "invalid input")
        self.senderCollection = account.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(from: __NFT_STORAGE_PATH__)!
    }

    execute {
        for index, tokenId in tokenIds {
            let recipient = recipients[index]
            let recipientAccount = getAccount(recipient)
            let recipientCollection = recipientAccount.capabilities.get<&{NonFungibleToken.CollectionPublic}>(__NFT_PUBLIC_PATH__).borrow()
                ?? panic("Could not borrow capability from recipient")

            let nft <- self.senderCollection.withdraw(withdrawID: tokenId)
            if(nft == nil){
                panic("NFT not found!")
            }
            recipientCollection.deposit(token: <-nft)
        }
    }
}