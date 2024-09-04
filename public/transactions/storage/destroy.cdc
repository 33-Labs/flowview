import "Burner"

transaction() {
  prepare(signer: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account) {
    if let rsc <- signer.storage.load<@AnyResource>(from: __PATH__) {
      Burner.burn(<- rsc)
    }
  }
}