import HybridCustody from 0xHybridCustody

transaction(child: Address) {
    prepare (acct: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account) {
        let manager = acct.storage.borrow<auth(HybridCustody.Manage) &HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
            ?? panic("manager no found")
        manager.removeChild(addr: child)
    }
}