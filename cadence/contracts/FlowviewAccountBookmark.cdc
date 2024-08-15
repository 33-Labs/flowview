access(all) contract FlowviewAccountBookmark {

  access(all) entitlement Manage

  access(all) let AccountBookmarkCollectionStoragePath: StoragePath
  access(all) let AccountBookmarkCollectionPublicPath: PublicPath
  access(all) let AccountBookmarkCollectionPrivatePath: PrivatePath

  access(all) event AccountBookmarkAdded(owner: Address, address: Address, note: String)
  access(all) event AccountBookmarkRemoved(owner: Address, address: Address)

  access(all) event ContractInitialized()

  access(all) resource interface AccountBookmarkPublic {
    access(all) let address: Address
    access(all) var note: String
  }

  access(all) resource AccountBookmark: AccountBookmarkPublic {
    access(all) let address: Address
    access(all) var note: String

    init(address: Address, note: String) {
      self.address = address
      self.note = note
    }

    access(Manage) fun setNote(note: String) {
      self.note = note
    }
  }

  access(all) resource interface CollectionPublic {
    access(all) view fun borrowPublicAccountBookmark(address: Address): &AccountBookmark?
    access(all) view fun getAccountBookmarks(): &{Address: AccountBookmark}
  }

  access(all) resource AccountBookmarkCollection: CollectionPublic {
    access(all) let bookmarks: @{Address: AccountBookmark}

    init() {
      self.bookmarks <- {}
    }

    access(Manage) fun addAccountBookmark(address: Address, note: String) {
      pre {
        self.bookmarks[address] == nil: "Account bookmark already exists"
      }
      self.bookmarks[address] <-! create AccountBookmark(address: address, note: note)
      emit AccountBookmarkAdded(owner: self.owner!.address, address: address, note: note)
    }

    access(Manage) fun removeAccountBookmark(address: Address) {
      destroy self.bookmarks.remove(key: address)
      emit AccountBookmarkRemoved(owner: self.owner!.address, address: address)
    }

    access(all) view fun borrowPublicAccountBookmark(address: Address): &AccountBookmark? {
      return &self.bookmarks[address]
    }

    access(Manage) fun borrowAccountBookmark(address: Address): auth(Manage) &AccountBookmark? {
      return &self.bookmarks[address]
    }

    access(all) view fun getAccountBookmarks(): &{Address: AccountBookmark} {
      return &self.bookmarks
    }
  }

  access(all) fun createEmptyCollection(): @AccountBookmarkCollection {
    return <-create AccountBookmarkCollection()
  }

  init() {
    self.AccountBookmarkCollectionStoragePath = /storage/flowviewAccountBookmarkCollection
    self.AccountBookmarkCollectionPublicPath = /public/flowviewAccountBookmarkCollection
    self.AccountBookmarkCollectionPrivatePath = /private/flowviewAccountBookmarkCollection

    emit ContractInitialized()
  }
}