import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Layout from "../../../../components/common/Layout"
import { bulkGetNftCatalog, bulkGetStoredItems } from "../../../../flow/scripts"
import { isValidFlowAddress, classNames, collectionsWithCatalogInfo, collectionsWithExtraData, collectionsWithDisplayInfo } from "../../../../lib/utils"
import Custom404 from "../404"
import publicConfig from "../../../../publicConfig"
import Spinner from "../../../../components/common/Spinner"
import CollectionView from "../../../../components/common/CollectionView"
import { useRecoilState } from "recoil"
import { currentStoredItemsState, nftCatalogState } from "../../../../lib/atoms"
import { Switch } from "@headlessui/react"
import Image from "next/image"

export default function Collection(props) {
  const router = useRouter()
  const { account } = router.query

  const [hideEmptyCollections, setHideEmptyCollections] = useState(true)
  const [filteredCollections, setFilteredCollections] = useState(null)
  const [collections, setCollections] = useState(null)
  const [collectionData, setCollectionData] = useState(null)
  const [currentStoredItems, setCurrentStoredItems] = useRecoilState(currentStoredItemsState)
  const [nftCatalog, setNftCatalog] = useRecoilState(nftCatalogState)

  useEffect(() => {
    if (publicConfig.chainEnv === "emulator") {
      setNftCatalog({})
      return
    }

    if (!nftCatalog) {
      bulkGetNftCatalog().then((catalog) => {
        setNftCatalog(catalog)
      }).catch((e) => console.error(e))
    }
  }, [])

  useEffect(() => {
    if (account && isValidFlowAddress(account)) {
      if (!currentStoredItems || (currentStoredItems.length > 0 && currentStoredItems[0].address != account)) {
        bulkGetStoredItems(account).then((items) => {
          const orderedItems = items.sort((a, b) => a.path.localeCompare(b.path))
          setCurrentStoredItems(orderedItems)
        }).catch((e) => console.error(e))
      } else {
        setCollectionData(currentStoredItems.filter((item) => item.isNFTCollection && item.tokenIDs.length >= 0))
      }
    }
  }, [currentStoredItems, account])

  useEffect(() => {
    if (collectionData) {
      const newCollection =
        collectionsWithExtraData(collectionsWithDisplayInfo(collectionData))
      setCollections(newCollection)
    }
  }, [collectionData])

  useEffect(() => {
    if (nftCatalog && collections && collections.length > 0 && !collections[0].addedCatalogInfo) {
      const newCollections = collectionsWithCatalogInfo(collections, nftCatalog)
      setCollections(newCollections)
    }
  }, [nftCatalog, collections])

  useEffect(() => {
    if (collections) {
      if (hideEmptyCollections) {
        setFilteredCollections(collections.filter((c) => c.tokenIDs.length > 0))
      } else {
        setFilteredCollections(collections)
      }
    }
  }, [collections, hideEmptyCollections])

  if (!account) {
    return <div className="h-screen"></div>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showCollections = () => {
    if (!collections || !filteredCollections) {
      return (
        <div className="flex w-full mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    } else {
      return (
        <>
          {
            filteredCollections.length > 0 ?
              filteredCollections.map((collection, index) => {
                return (
                  <CollectionView account={account} collection={collection} key={`${collection.path}_${index}`} />
                )
              }) :
              <div className="flex w-full mt-10 h-[70px] text-gray-400 text-base justify-center">
                Nothing found
              </div>
          }
        </>
      )
    }
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div className="flex w-full flex-col gap-y-3 overflow-auto">
          <div className="sm:min-w-[540px] p-2 flex flex-wrap gap-y-1 gap-x-3 justify-between">
            <div className="flex flex-col gap-y-2 sm:flex-row sm:gap-x-2 sm:items-center justify-center">
              <h1 className="shrink-0 text-xl sm:text-2xl font-bold text-gray-900">
                {`Collections ${filteredCollections ? `(${filteredCollections.length})` : ""}`}
              </h1>
              <div className="flex gap-x-2 items-center">
                <label className="shrink-0 block text-gray-600 text-base font-normal font-flow">
                  Hide empty collections
                </label>
                <Switch
                  checked={hideEmptyCollections}
                  onChange={async () => {
                    setHideEmptyCollections(!hideEmptyCollections)
                  }}
                  className={classNames(
                    hideEmptyCollections ? 'bg-drizzle' : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      hideEmptyCollections ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    )}
                  />
                </Switch>
              </div>
            </div>
            <div className="hidden sm:flex sm:gap-x-2 sm:items-center px-1 overflow-hidden">
              {/* <label className={`item-start hidden sm:block cursor-pointer text-black bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}>
              <a href={`${publicConfig.drizzleURL}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Create raffle
              </a>
            </label> */}
              <a href={`http://nft.flowverse.co/marketplace`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2">
                <div className="flex items-center rounded-full ring-1 ring-drizzle px-2 py-1 text-xs sm:text-sm text-black">
                  <Image src="/flowverse.png" alt="" width={20} height={20} />&nbsp;Trade on Flowverse
                </div>
              </a>
              <a href={`https://www.flowty.io/marketplace`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2">
                <div className="flex items-center rounded-full ring-1 ring-drizzle px-2 py-1 text-xs sm:text-sm text-black">
                  <Image className="rounded-full" src="/flowty.jpg" alt="" width={20} height={20} />&nbsp;Trade on Flowty
                </div>
              </a>
            </div>
          </div>
          <div className="px-2 py-2 overflow-x-auto max-h-screen w-full">
            <div className="inline-block min-w-full">
              <div className="flex flex-col gap-y-4">
                {showCollections()}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  )
}