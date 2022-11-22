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
        <div className="flex flex-col w-full">
          {
            nft.collectionIdentifier ?
              <div className="flex gap-x-1 w-full justify-between">
                <label className="text-lg font-bold">
                  {`${nft.collectionIdentifier} (${nft.nftIDs.length})`}
                </label>
                <div className="flex gap-x-1">
                  <label className={`cursor-pointer font-semibold text-xs px-2 py-1 leading-5 rounded-xl bg-catalog text-white`}>
                    <a href={`${publicConfig.nftCatalogURL}/${nft.collectionIdentifier}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on NFTCatalog
                    </a>
                  </label>
                  <label className={`cursor-pointer font-semibold text-xs px-2 py-1 leading-5 rounded-xl bg-drizzle text-black`}>
                    <a href={`${publicConfig.drizzleURL}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Create raffle
                    </a>
                  </label>
                </div>
              </div>
              :
              <label className="font-bold text-lg">{`${nft.contractName} (${nft.nftIDs.length})`}</label>
          }
          <label>
            {
              nft.contract.startsWith("A.") ?
                <a
                  href={`${publicConfig.flowscanURL}/contract/${nft.contract}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-sm font-bold decoration-drizzle decoration-2">
                  {nft.contract}
                </a> :
                <span>{nft.contract}</span>
            }

          </label>
        </div>
      </div>
      <NFTDisplayView nft={nft} />
    </div>
  )
}