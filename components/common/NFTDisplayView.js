import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { bulkGetNftDisplays } from "../../flow/scripts"
import { getImageSrcFromMetadataViewsFile, isValidFlowAddress } from "../../lib/utils"
import NFTDisplay from "./NFTDisplay"
import Spinner from "./Spinner"

export default function NFTDisplayView(props) {
  const router = useRouter()
  const { account } = router.query
  const { nft, setNeedRelink } = props

  const [displayData, setDisplayData] = useState(null)
  const [displays, setDisplays] = useState(null)
  const limit = 10

  const loadDisplays = () => {
    if (nft && account && isValidFlowAddress(account)) {
      bulkGetNftDisplays(account, nft, limit, (displays || []).length)
        .then((data) => {
          setDisplayData(data)
        })
        .catch((e) => {
          console.error(e)
        })
    }
  }

  useEffect(() => {
    loadDisplays()
  }, [])

  const checkNeedRelink = (nft, display) => {
    if (!nft.catalog) { return false }
    if (!nft.collectionIdentifier) { return false }
    const nftImageSrc = getImageSrcFromMetadataViewsFile(nft.catalog.squareImage.file)
    const displayImage = display.imageSrc
    return display.imageSrc == nftImageSrc
  }

  const getImageSrc = (file) => {
    const src = getImageSrcFromMetadataViewsFile(file)
    if (src == "/token_placeholder.png") {
      return nft.catalog ? getImageSrcFromMetadataViewsFile(nft.catalog.squareImage.file) : "/token_placeholder.png"
    }
    return src
  }

  useEffect(() => {
    if (displays && displays.length > 0) {

      setNeedRelink(checkNeedRelink(nft, displays[0]))
    }
  }, [displays])

  useEffect(() => {
    if (displayData) {
      const displayArray = []
      for (const [tokenID, display] of Object.entries(displayData)) {
        const copyDisplay = Object.assign({}, display)
        copyDisplay.imageSrc = getImageSrc(display.thumbnail)
        copyDisplay.tokenID = tokenID
        displayArray.push(copyDisplay)
      }

      setDisplays((oldState) => {
        const oldArray = oldState || []
        const newArray = displayArray.sort((a, b) => a.tokenID - b.tokenID)
        if (oldArray.length == 0 || (newArray.length > 0 && oldArray[oldArray.length - 1].tokenID != newArray[newArray.length - 1].tokenID)) {
          return oldArray.concat(newArray)
        }
        return oldArray
      })
    }
  }, [displayData])

  const showDisplays = () => {
    if (!displays) {
      return (
        <div className="flex mt-10 h-[168px] justify-center">
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
            {
              displays.length < nft.nftIDs.length ?
                <div className="w-32 rounded-2xl shadow-md bg-drizzle-light hover:bg-drizzle font-bold">
                  <button
                    className="w-full h-full"
                    onClick={() => {
                      loadDisplays()
                    }}>
                    Load more
                  </button>
                </div> : null
            }
          </div> : <div className="flex mt-10 h-[70px] text-gray-400 text-base justify-center">
            Nothing found
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