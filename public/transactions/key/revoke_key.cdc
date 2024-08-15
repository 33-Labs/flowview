transaction(keyIndex: Int) {
  prepare(signer: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account) {
    signer.keys.revoke(keyIndex: keyIndex)
  }
}