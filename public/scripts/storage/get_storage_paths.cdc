access(all) fun main(address: Address): [StoragePath] {
    var storagePaths: [StoragePath] = []
    let account = getAuthAccount<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(address)
    account.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
        storagePaths.append(path)
        return true
    })
    return storagePaths
}