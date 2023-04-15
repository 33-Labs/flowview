pub contract FlowviewAccountBookmark {

  pub let AccountBookmarkCollectionStoragePath: StoragePath
  pub let AccountBookmarkCollectionPublicPath: PublicPath
  pub let AccountBookmarkCollectionPrivatePath: PrivatePath

  pub event ContractInitialized()

  pub resource interface AccountBookmarkPublic {
    pub let address: Address
    pub var name: String
    pub var note: String
  }

  pub resource AccountBookmark: AccountBookmarkPublic {
    pub let address: Address
    pub var name: String
    pub var note: String

    init(address: Address, name: String, note: String) {
      self.address = address
      self.name = name
      self.note = note
    }

    pub fun setName(name: String) {
      self.name = name
    }

    pub fun setNote(note: String) {
      self.note = note
    }
  }

  pub resource interface CollectionPublic {
    pub fun borrowPublicAccountBookmark(address: Address): &AccountBookmark{AccountBookmarkPublic}?
    pub fun getAccountBookmarks(): &{Address: AccountBookmark{AccountBookmarkPublic}}
  }

  pub resource AccountBookmarkCollection: CollectionPublic {
    pub let bookmarks: @{Address: AccountBookmark}

    init() {
      self.bookmarks <- {}
    }

    pub fun addAccountBookmark(address: Address, name: String, note: String) {
      pre {
        self.bookmarks[address] == nil: "Account bookmark already exists"
      }
      self.bookmarks[address] <-! create AccountBookmark(address: address, name: name, note: note)
    }

    pub fun removeAccountBookmark(address: Address) {
      destroy self.bookmarks.remove(key: address)
    }

    pub fun borrowPublicAccountBookmark(address: Address): &AccountBookmark{AccountBookmarkPublic}? {
      return &self.bookmarks[address] as &AccountBookmark{AccountBookmarkPublic}?
    }

    pub fun borrowAccountBookmark(address: Address): &AccountBookmark? {
      return &self.bookmarks[address] as &AccountBookmark?
    }

    pub fun getAccountBookmarks(): &{Address: AccountBookmark{AccountBookmarkPublic}} {
      return &self.bookmarks as &{Address: AccountBookmark{AccountBookmarkPublic}}
    }

    destroy() {
      destroy self.bookmarks
    }
  }

  pub fun createEmptyCollection(): @AccountBookmarkCollection {
    return <-create AccountBookmarkCollection()
  }

  init() {
    self.AccountBookmarkCollectionStoragePath = /storage/flowviewAccountBookmarkCollection
    self.AccountBookmarkCollectionPublicPath = /public/flowviewAccountBookmarkCollection
    self.AccountBookmarkCollectionPrivatePath = /private/flowviewAccountBookmarkCollection

    emit ContractInitialized()
  }
}