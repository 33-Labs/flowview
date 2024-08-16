transaction(
  publicKey: String,
  signAlgo: UInt8,
  hashAlgo: UInt8,
  weight: UFix64
) {
  prepare(signer: auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account) {
    let pubkey = PublicKey(
      publicKey: publicKey.decodeHex(),
      signatureAlgorithm: SignatureAlgorithm(rawValue: signAlgo)!
    )

    signer.keys.add(
      publicKey: pubkey,
      hashAlgorithm: HashAlgorithm(rawValue: hashAlgo)!,
      weight: weight
    )
  }
}