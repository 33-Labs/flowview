#allowAccountLinking

import HybridCustody from 0xHybridCustody

transaction(owner: Address) {
    prepare(acct: auth(Storage) &Account) {
        let owned = acct.storage.borrow<auth(HybridCustody.Owner) &HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath)
            ?? panic("owned not found")
        owned.giveOwnership(to: owner)
    }
}