import { PlusCircleIcon } from "@heroicons/react/outline"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { bulkGetNftDisplays, bulkGetNftViews } from "../../flow/scripts"
import { getImageSrcFromMetadataViewsFile, isValidFlowAddress } from "../../lib/utils"
import NFTDisplay from "./NFTDisplay"
import NFTView from "./NFTView"
import Spinner from "./Spinner"

export default function NFTListView(props) {
  const router = useRouter()
  const { account } = router.query
  const { collection, setNeedRelink } = props

  const [displayData, setDisplayData] = useState(null)
  const [displays, setDisplays] = useState(null)
  const limit = 20

  const loadDisplays = () => {
    if (collection && account && isValidFlowAddress(account)) {
      const offset = (displays || []).length
      bulkGetNftViews(account, collection, limit, offset)
        .then((data) => {
          setDisplayData(data)
        })
        .catch((e) => {
          const totalTokenIDs = collection.tokenIDs
          const tokenIDs = totalTokenIDs.slice(offset, offset + limit)
          const placeholders = {}
          for (let i = 0; i < tokenIDs.length; i++) {
            const tokenID = tokenIDs[i]
            placeholders[tokenID] = {
              name: collection.contractName,
              description: "",
              thumbnail: {url: ""}
            }
          }
          setDisplayData(placeholders)
          console.error(e)
        })
    }
  }

  useEffect(() => {
    loadDisplays()
  }, [])

  // TODO: Enhance
  const checkNeedRelink = (collection, display) => {
    if (!collection.squareImage) { return false }
    if (!collection.collectionIdentifier) { return false }
    return display.thumbnail && display.thumbnail.url && display.thumbnail.url == ""
  }

  const getImageSrc = (file) => {
    const src = getImageSrcFromMetadataViewsFile(file)
    if (src == "/token_placeholder.png") {
      return collection.squareImage ? getImageSrcFromMetadataViewsFile(collection.squareImage.file) : "/token_placeholder.png"
    }
    return src
  }

  useEffect(() => {
    if (displays && displays.length > 0) {
      setNeedRelink(checkNeedRelink(collection, displays[0]))
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
      <div className="flex flex-col gap-y-4 w-full py-3">
        {displays.length > 0 ?
          <div className="flex flex-wrap gap-x-3 gap-y-3 w-full">
            {
              displays.map((display, index) => {
                return (
                  <NFTView display={display} key={`${display.tokenID}_${index}`} />
                )
              })
            }
            {
              displays.length < collection.tokenIDs.length ?
                <div className="w-36 rounded-2xl shadow-md bg-drizzle-light hover:bg-drizzle font-bold">
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