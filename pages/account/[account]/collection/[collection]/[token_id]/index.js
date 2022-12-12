import { ArrowLeftIcon } from "@heroicons/react/outline"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Layout from "../../../../../../components/common/Layout"
import NFTDetailView from "../../../../../../components/common/NFTDetailView"
import Spinner from "../../../../../../components/common/Spinner"
import { getNftMetadataViews } from "../../../../../../flow/scripts"
import { isValidFlowAddress } from "../../../../../../lib/utils"
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
        <div className="p-1 w-[1076px] h-screen overflow-auto">
          <NFTDetailView metadata={metadata} />
        </div>
      )
    }
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div className="flex w-full flex-col gap-y-3">
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

          <div className="w-[calc(min(100vw,80rem)-160px)] sm:w-[calc(min(100vw,80rem)-192px)] overflow-scroll">
          {showToken()}
          </div>
        </div>
      </Layout>
    </div>
  )
}