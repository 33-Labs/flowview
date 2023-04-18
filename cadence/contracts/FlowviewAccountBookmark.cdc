pub contract FlowviewAccountBookmark {

  pub let AccountBookmarkCollectionStoragePath: StoragePath
  pub let AccountBookmarkCollectionPublicPath: PublicPath
  pub let AccountBookmarkCollectionPrivatePath: PrivatePath

  pub event AccountBookmarkAdded(owner: Address, address: Address, note: String)
  pub event AccountBookmarkRemoved(owner: Address, address: Address)

  pub event ContractInitialized()

  pub resource interface AccountBookmarkPublic {
    pub let address: Address
    pub var note: String
  }

  pub resource AccountBookmark: AccountBookmarkPublic {
    pub let address: Address
    pub var note: String

    init(address: Address, note: String) {
      self.address = address
      self.note = note
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

    pub fun addAccountBookmark(address: Address, note: String) {
      pre {
        self.bookmarks[address] == nil: "Account bookmark already exists"
      }
      self.bookmarks[address] <-! create AccountBookmark(address: address, note: note)
      emit AccountBookmarkAdded(owner: self.owner!.address, address: address, note: note)
    }

    pub fun removeAccountBookmark(address: Address) {
      destroy self.bookmarks.remove(key: address)
      emit AccountBookmarkRemoved(owner: self.owner!.address, address: address)
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