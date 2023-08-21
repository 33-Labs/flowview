import HybridCustody from 0xHybridCustody

transaction(parent: Address) {
    prepare(acct: AuthAccount) {
        let owned = acct.borrow<&HybridCustody.OwnedAccount>(from: HybridCustody.OwnedAccountStoragePath)
            ?? panic("owned not found")

        owned.removeParent(parent: parent)

        let manager = getAccount(parent).getCapability<&HybridCustody.Manager{HybridCustody.ManagerPublic}>(HybridCustody.ManagerPublicPath)
            .borrow() ?? panic("manager not found")
        let children = manager.getChildAddresses()
        assert(!children.contains(acct.address), message: "removed child is still in manager resource")
    }
}