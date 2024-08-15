transaction() {
  prepare(signer: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account) {
    signer.capabilities.unpublish(__PATH__)
  }
}