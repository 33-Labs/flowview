#allowAccountLinking

import HybridCustody from 0xHybridCustody

transaction(owner: Address) {
    prepare(acct: AuthAccount) {
        let owned = acct.borrow<&HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath)
            ?? panic("owned not found")
        owned.giveOwnership(to: owner)
    }
}