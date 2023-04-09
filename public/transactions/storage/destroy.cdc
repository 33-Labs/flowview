transaction() {
  prepare(signer: AuthAccount) {
    if let rsc <- signer.load<@AnyResource>(from: __PATH__) {
      destroy rsc
    }
  }
}