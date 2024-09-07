#allowAccountLinking

import HybridCustody from 0xHybridCustody

transaction(ownedAddress: Address, owner: Address) {
    prepare(acct: auth(Storage) &Account) {
        let manager = acct.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager not found")
        manager.giveOwnership(addr: ownedAddress, to: owner)
    }
}