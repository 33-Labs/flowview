import { ArrowLeftIcon, GlobeAltIcon } from "@heroicons/react/outline"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useRecoilState } from "recoil"
import Layout from "../../../../../../components/common/Layout"
import NFTDetailView from "../../../../../../components/common/NFTDetailView"
import Spinner from "../../../../../../components/common/Spinner"
import { bulkGetNftCatalog, getNftMetadataViews, getStoredItems } from "../../../../../../flow/scripts"
import { nftCatalogState } from "../../../../../../lib/atoms"
import { collectionsWithCatalogInfo, collectionsWithExtraData, getImageSrcFromMetadataViewsFile, isValidFlowAddress, isValidStoragePath } from "../../../../../../lib/utils"
import publicConfig from "../../../../../../publicConfig"
import Custom404 from "../../../404"

export default function NFT(props) {
  const router = useRouter()
  const { account: account, collection: collectionPath, token_id: tokenID } = router.query

  console.log("account", account)
  console.log("collectionPath", collectionPath)
  console.log("tokenID", tokenID)

  const [metadataError, setMetadataError] = useState(null)
  const [metadata, setMetadata] = useState(null)

  useEffect(() => {
    if (account && isValidFlowAddress(account)) {
      getNftMetadataViews(account, collectionPath, tokenID).then((metadataViews) => {
        setMetadata(metadataViews)
      }).catch((e) => {
        console.error(e)
        setMetadataError("Get metadata failed")
      })
    }
  }, [account])

  if (!account) {
    return <div className="h-screen"></div>
  }

  if (account && isValidFlowAddress(account)) {
    if (!collectionPath) {
      return <Custom404 title={"Collection not found"} />
    }
  } else {
    return <Custom404 title={"Account may not exist"} />
  }

  if (metadataError) {
    return <Custom404 title={metadataError} />
  }

  const showToken = () => {
    if (!metadata) {
      return (
        <div className="flex w-full mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    } else {
      return (
        <div className="p-2 w-full h-screen overflow-auto">
          <NFTDetailView metadata={metadata} />
        </div>
      )
    }
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div className="flex w-full flex-col gap-y-3 overflow-auto">
          <div className="min-w-[1076px] p-2 flex gap-x-2 justify-between w-full">
            <div className="flex flex-col gap-y-2 justify-center w-full">
              <button
                className="mb-2"
                onClick={() => {
                  router.push({
                    pathname: "/account/[account]/collection/[collection]",
                    query: { account: account, collection: collectionPath }
                  }, undefined, { shallow: true, scroll: false })
                }}
              >
                <div className=" flex gap-x-2 text-drizzle items-center">
                  <ArrowLeftIcon className="h-5 w-5" />
                  <label className="cursor-pointer">Collection Detail</label>
                </div>
              </button>

              {showToken()}
            </div>
          </div>
        </div>
      </Layout>
    </div>
  )
}