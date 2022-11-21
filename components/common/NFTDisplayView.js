import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { bulkGetNftDisplays } from "../../flow/scripts"
import { getImageSrcFromMetadataViewsFile, isValidFlowAddress } from "../../lib/utils"
import NFTDisplay from "./NFTDisplay"
import Spinner from "./Spinner"

const displayFetcher = async (funcName, account, nft) => {
  return await bulkGetNftDisplays(account, nft)
}


export default function NFTDisplayView(props) {
  const router = useRouter()
  const { account } = router.query
  const { nft } = props

  const [displays, setDisplays] = useState(null)

  const { data: displayData, error: displayError } = useSWR(
    account && isValidFlowAddress(account) && nft && nft.nftIDs && nft.nftIDs.length > 0 ?
      ["displayFetcher", account, nft] : null, displayFetcher
  )

  useEffect(() => {
    if (displayData) {
      const displayArray = []
      for (const [tokenID, display] of Object.entries(displayData)) {
        if (!display) {
          displayArray.push({
            tokenID: tokenID,
            imageSrc: null,
            name: `${nft.contractName}`
          })
          continue
        }

        const copyDisplay = Object.assign({}, display)
        copyDisplay.imageSrc = getImageSrcFromMetadataViewsFile(display.thumbnail)
        copyDisplay.tokenID = tokenID
        displayArray.push(copyDisplay)
      }
      setDisplays(displayArray.sort((a, b) => a.tokenID - b.tokenID))
    }
  }, [displayData])

  const showDisplays = () => {
    if (!displays) {
      return (
        <div className="flex mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-y-4">
        {displays.length > 0 ?
          <div className="flex gap-x-3 py-2">
            {
              displays.map((display, index) => {
                return (
                  <NFTDisplay display={display} key={`${display.tokenID}_${index}`} />
                )
              })
            }
          </div> : <div className="flex mt-10 h-[200] text-gray-400 text-xl justify-center">
            You do not have NFT of this collection
          </div>
        }
      </div>
    )
  }

  return (
    <div className="px-1 overflow-auto w-full">
      <div className="inline-block min-w-full">
        {showDisplays()}
      </div>
    </div>
  )
}