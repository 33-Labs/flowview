transaction(
  publicKey: String,
  signAlgo: UInt8,
  hashAlgo: UInt8,
  weight: UFix64
) {
  prepare(signer: AuthAccount) {
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