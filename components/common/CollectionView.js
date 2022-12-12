import Image from "next/image"
import publicConfig from "../../publicConfig"
import { getImageSrcFromMetadataViewsFile } from "../../lib/utils"
import { useRouter } from "next/router"

export default function CollectionView(props) {
  const router = useRouter()
  const { account, collection } = props
  if (collection.tokenIDs.length > 0) {
    console.log(collection)
  }

  return (
    <div className="flex flex-col max-w-[1094px] min-w-[1076px] gap-y-3 p-4 shadow-md rounded-2xl bg-white">
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
                <a href={`${publicConfig.nftCatalogURL}/${collection.collectionIdentifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >

                  <div className="h-[24px] aspect-square shrink-0 relative">
                    <Image src={"/nft-catalog.png"} alt="" fill sizes="10vw" className="object-contain" />
                  </div>
                </a>
              </label> : null
          }
          {
            <button
              type="button"
              className={"text-black bg-drizzle disabled:bg-drizzle-light disabled:text-gray-400 hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0"}
              disabled={collection.tokenIDs.length == 0}
              onClick={async () => {
                router.push({
                  pathname: `${router.pathname}/[collection]`,
                  query: { account: account, collection: collection.path.replace("/storage/", "") }
                }, undefined, { shallow: true })
              }}
            >
              {`Show Detail`}
            </button>
          }
        </div>
      </div>
    </div>
  )
}