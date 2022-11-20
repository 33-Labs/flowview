import Image from "next/image"
import NFTDisplayView from "./NFTDisplayView"
import publicConfig from "../../publicConfig"
import { getImageSrcFromMetadataViewsFile } from "../../lib/utils"

export default function NFTView(props) {
  const { nft } = props

  return (
    <div className="flex flex-col max-w-[1076px] gap-y-3 p-4 shadow-md rounded-2xl bg-white">
      <div className="flex items-center gap-x-3">
        <div className="w-11 aspect-square relative">
          <Image src={nft.catalog ? getImageSrcFromMetadataViewsFile(nft.catalog.squareImage.file) : "/token_placeholder.png"} alt="" fill sizes="33vw" priority={true} />
        </div>
        <div className="flex flex-col">
          {
            nft.collectionIdentifier ?
              <label className="text-lg font-bold">
                <a
                  href={`${publicConfig.nftCatalogURL}/${nft.collectionIdentifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-drizzle decoration-2">
                  {`${nft.collectionIdentifier}`}
                </a>
                {` (${nft.nftIDs.length})`}
              </label> :
              <label className="font-bold text-lg">{`${nft.contractName} (${nft.nftIDs.length})`}</label>
          }
          <label>
            <a
              href={`${publicConfig.flowscanURL}/contract/${nft.contract}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-sm font-bold decoration-drizzle decoration-2">
              {nft.contract}
            </a>
          </label>
        </div>
      </div>
      <NFTDisplayView nft={nft} />
    </div>
  )
}