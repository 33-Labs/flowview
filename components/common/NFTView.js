import Image from "next/image"
import NFTDisplayView from "./NFTDisplayView"
import publicConfig from "../../publicConfig"
import { getImageSrcFromMetadataViewsFile } from "../../lib/utils"
import { useState } from "react"

export default function NFTView(props) {
  const { nft } = props

  const [showNFTs, setShowNFTs] = useState(false)
  const [needRelink, setNeedRelink] = useState(false)

  return (
    <div className="flex flex-col w-[1076px] gap-y-3 p-4 shadow-md rounded-2xl bg-white">

      <div className="flex gap-x-3 justify-between">
        <div className="flex items-center gap-x-3">
          <div className="w-11 rounded-full overflow-hidden aspect-square relative">
            <Image src={nft.catalog ? getImageSrcFromMetadataViewsFile(nft.catalog.squareImage.file) : "/token_placeholder.png"} alt="" fill sizes="10vw" priority={true} />
          </div>
          <div className="flex flex-col w-full">
            {
              nft.collectionIdentifier ?
                <label className="text-lg font-bold">
                  {`${nft.collectionIdentifier} (${nft.nftIDs.length})`}
                </label>
                : <label className="font-bold text-lg">{`${nft.contractName} (${nft.nftIDs.length})`}</label>
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
        <div className="flex gap-x-1 items-center">
          <button
            type="button"
            className={"text-black bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0"}
            onClick={async () => {
              setShowNFTs(true)
            }}
          >
            Show NFTs
          </button>
          {
            nft.collectionIdentifier ?
              <label className={`cursor-pointer text-white bg-catalog hover:bg-catalog-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}>
                <a href={`${publicConfig.nftCatalogURL}/${nft.collectionIdentifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on NFTCatalog
                </a>
              </label> : null
          }
        </div>
      </div>
      {
        nft.collectionIdentifier && needRelink ?
          <label>This collection need to&nbsp;
            <a href={`${publicConfig.linkURL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold decoration-drizzle decoration-2"
            >
              {`RELINK`}
            </a>
            &nbsp;to see the metadata</label> : null
      }
      {
        showNFTs ?
          <NFTDisplayView nft={nft} setNeedRelink={setNeedRelink} /> : null
      }
    </div>
  )
}