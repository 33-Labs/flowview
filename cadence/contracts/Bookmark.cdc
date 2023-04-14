contract FlowviewAccountBookmark {

  pub let AccountBookmarkCollectionStoragePath: StoragePath
  pub let AccountBookmarkCollectionPublicPath: PublicPath
  pub let AccountBookmarkCollectionPrivatePath: PrivatePath

  pub event ContractInitialized()

  pub resource AccountBookmark {
    pub let address: Address
    pub let note: String
    pub let tags: {String: Int64}

    init(address: Address, note: String) {
      self.address = address
      self.note = note
      self.tags = {}
    }

    pub fun addTag(tag: String) {
      self.tags[tag] = 0
    }

    pub fun removeTag(tag: String) {
      self.tags.remove(key: tag)
    }

    pub fun getTags(): {String: Int64} {
      return self.tags
    }

    pub fun setNote(note: String) {
      self.note = note
    }
  }

  pub resource interface CollectionPublic {
    pub fun getAccountBookmark(address: Address): AccountBookmark?
    pub fun getAccountBookmarks(): &{Address: AccountBookmark}
  }

  pub resource AccountBookmarkCollection: CollectionPublic {
    pub let bookmarks: @{Address: AccountBookmark}

    init() {
      self.bookmarks = {}
    }

    pub fun addAccountBookmark(address: Address, note: String) {
      self.bookmarks[address] = Bookmark(address: address, note: note)
    }

    pub fun removeAccountBookmark(address: Address) {
      self.bookmarks.remove(key: address)
    }

    pub fun getAccountBookmark(address: Address): AccountBookmark? {
      return self.bookmarks[address]
    }

    pub fun getAccountBookmarks(): &{Address: AccountBookmark} {
      return &self.bookmarks
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