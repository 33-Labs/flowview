import Image from "next/image"
import CollectionDisplayView from "./CollectionDisplayView"
import publicConfig from "../../publicConfig"
import { getImageSrcFromMetadataViewsFile } from "../../lib/utils"
import { useState } from "react"
import { useRouter } from "next/router"
import { account } from "@onflow/fcl"

export default function CollectionView(props) {
  const router = useRouter()
  const { account, collection } = props

  const [showNFTs, setShowNFTs] = useState(false)
  const [needRelink, setNeedRelink] = useState(false)

  return (
    <div className="flex flex-col max-w-[1094px] min-w-[1076px] gap-y-3 p-4 shadow-md rounded-2xl bg-white">

      <div className="flex gap-x-3 justify-between">
        <div className="flex items-center gap-x-3">
          <div className="w-11 rounded-full overflow-hidden aspect-square relative">
            <Image src={collection.squareImage ? getImageSrcFromMetadataViewsFile(collection.squareImage.file) : "/token_placeholder.png"} alt="" fill sizes="10vw" priority={true} />
          </div>
          <div className="flex flex-col w-full">
            {
              collection.collectionIdentifier ?
                <label className="text-lg font-bold">
                  {`${collection.collectionIdentifier} (${collection.tokenIDs.length})`}
                </label>
                : <label className="font-bold text-lg">{`${collection.contractName} (${collection.tokenIDs.length})`}</label>
            }
            <label>
              {
                collection.collectionIdentifier ?
                  <a
                    href={`${publicConfig.flowscanURL}/contract/${collection.uuid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-sm font-bold decoration-drizzle decoration-2">
                    {collection.uuid}
                  </a> : collection.path
              }

            </label>
          </div>
        </div>
        <div className="flex gap-x-1 items-center">
          {
            collection.tokenIDs.length > 0 ?
              <button
                type="button"
                className={"text-black bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0"}
                onClick={async () => {
                  router.push({ 
                    pathname: `${router.pathname}/[collection]`, 
                    query: { account: account, collection: collection.path.replace("/storage/", "")}
                  }, undefined, { shallow: true, scroll: false })
                }}
              >
                {
                  showNFTs ? "Hide NFTs" : "Show NFTs"
                }
              </button> : null
          }

          {
            collection.collectionIdentifier ?
              <label className={`cursor-pointer text-white bg-catalog hover:bg-catalog-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}>
                <a href={`${publicConfig.nftCatalogURL}/${collection.collectionIdentifier}`}
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
        showNFTs && collection.collectionIdentifier && needRelink ?
          <label className="text-rose-500">This collection need&nbsp;
            <a href={`${publicConfig.linkURL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold decoration-drizzle decoration-2"
            >
              {`RELINK`}
            </a>
            &nbsp;to show the metadata</label> : null
      }
      {
        showNFTs ?
          <CollectionDisplayView collection={collection} setNeedRelink={setNeedRelink} /> : null
      }
    </div>
  )
}