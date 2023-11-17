export const outdatedPathsMainnet = {
  storage: `
  let outdatedPaths: {StoragePath: Bool} = {
    /storage/FantastecNFTCollection: true,
    /storage/FantastecNFTMinter: true,
    /storage/jambbLaunchCollectiblesCollection: true,
    /storage/jambbLaunchCollectiblesMinter: true,
    /storage/RacingTimeCollection: true,
    /storage/RacingTimeMinter: true,
    /storage/MusicBlockCollection: true,
    /storage/MusicBlockMinter: true,
    /storage/MindtrixPackCollection: true,
    /storage/MindtrixPackSetCollection: true,
    /storage/SupportUkraineCollectionV10: true,
    /storage/SupportUkraineMinterV10: true,
    /storage/DropzTokenCollection: true,
    /storage/DropzTokenAdmin: true,
    /storage/TokenLendingUserCertificate001: true,
    /storage/TokenLendingPlaceMinterProxy001: true,
    /storage/TokenLendingPlaceAdmin: true,
    /storage/TokenLendingPlace001: true,
    /storage/BnGNFTCollection: true,
    /storage/FuseCollectiveCollection: true,
    /storage/NFTLXKickCollection: true,
    /storage/NFTLXKickMinter: true,
    /storage/revvTeleportCustodyAdmin: true
  }
  `,
  public: `
  let outdatedPaths: {PublicPath: Bool} = {
    /public/FantastecNFTCollection: true,
    /public/jambbLaunchCollectiblesCollection: true,
    /public/RacingTimeCollection: true,
    /public/MusicBlockCollection: true,
    /public/SupportUkraineCollectionV10: true,
    /public/DropzTokenCollection: true,
    /public/TokenLendingPlaceMinterProxy001: true,
    /public/TokenLendingPlace001: true,
    /public/BnGNFTCollection: true,
    /public/FuseCollectiveCollection: true,
    /public/NFTLXKickCollection: true,
    /public/MindtrixPackCollection: true,
    /public/MindtrixPackSetCollection: true
  }
  `,
  private: `
  let outdatedPaths: {PrivatePath: Bool} = {
    /private/MusicBlockCollectionProviderForNFTStorefront: true,
    /private/TokenLendingUserCertificate001: true,
    /private/BnGNFTMinter: true,
    /private/NFTLXKicksSneakerSets: true,
    /private/MindtrixPackSetCollection: true
  }
  `
}