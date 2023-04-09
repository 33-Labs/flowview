transaction() {
  prepare(signer: AuthAccount) {
    signer.unlink(__PATH__)
  }
}