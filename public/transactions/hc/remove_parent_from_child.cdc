import "HybridCustody"

transaction(parent: Address) {
    prepare(acct: auth(Storage) &Account) {
        let owned = acct.storage.borrow<auth(HybridCustody.Owner) &HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath)
            ?? panic("owned not found")

        owned.removeParent(parent: parent)

        let manager = getAccount(parent).capabilities.get<&{HybridCustody.ManagerPublic}>(HybridCustody.ManagerPublicPath)
            .borrow() ?? panic("manager not found")
        let children = manager.getChildAddresses()
        assert(!children.contains(acct.address), message: "removed child is still in manager resource")
    }
}