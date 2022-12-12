import Image from "next/image"
import publicConfig from "../../publicConfig"
import { getImageSrcFromMetadataViewsFile } from "../../lib/utils"
import { useRouter } from "next/router"
import { ArrowRightIcon } from "@heroicons/react/outline"

export default function CollectionView(props) {
  const router = useRouter()
  const { account, collection } = props

  return (
    <div className="flex flex-col max-w-[1094px] min-w-[1076px] gap-y-3 p-4 shadow-md rounded-2xl bg-white"
      onClick={() => {
        if (collection.tokenIDs.length == 0) {
          return
        }
        router.push({
          pathname: `${router.pathname}/[collection]`,
          query: { account: account, collection: collection.path.replace("/storage/", "") }
        }, undefined, { shallow: true })
      }}
    >
      <div className="flex gap-x-3 justify-between">
        <div className="flex items-center gap-x-3">
          <div className="w-11 rounded-full overflow-hidden aspect-square relative">
            <Image src={collection.squareImage ? getImageSrcFromMetadataViewsFile(collection.squareImage.file) : "/token_placeholder.png"} alt="" fill sizes="10vw" />
          </div>
          <div className="flex flex-col w-full">
            {
              collection.name ?
                <label className="text-lg font-bold">
                  {`${collection.name} (${collection.tokenIDs.length})`}
                </label>
                : <label className="font-bold text-lg">{`${collection.contractName} (${collection.tokenIDs.length})`}</label>
            }
            <label>
              {collection.path}
            </label>
          </div>
        </div>
        <div className="flex gap-x-2 items-center">
          {
            collection.collectionIdentifier ?
              <label className={`cursor-pointer shrink-0`}>
                <div className="h-[24px] aspect-square shrink-0 relative"
                  onClick={(event) => {
                    window.open(`${publicConfig.nftCatalogURL}/${collection.collectionIdentifier}`)
                    event.stopPropagation()
                  }}>
                  <Image src={"/nft-catalog.png"} alt="" fill sizes="10vw" className="object-contain" />
                </div>
              </label> : null
          }
          {
            <button
              type="button"
              className={"text-drizzle disabled:text-drizzle-light shrink-0"}
              disabled={collection.tokenIDs.length == 0}
              onClick={async () => {
              }}
            >
              <ArrowRightIcon className=" w-[24px] aspect-square shrink-0" />
            </button>
          }
        </div>
      </div>
    </div>
  )
}