import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Layout from "../../../components/common/Layout"
import { bulkGetNftCatalog, bulkGetPublicItems } from "../../../flow/scripts"
import { isValidFlowAddress, getResourceType, getContract } from "../../../lib/utils"
import Custom404 from "./404"
import publicConfig from "../../../publicConfig"
import Spinner from "../../../components/common/Spinner"
import CollectionView from "../../../components/common/CollectionView"
import { useRecoilState } from "recoil"
import { currentPublicItemsState, nftCatalogState } from "../../../lib/atoms"

const collectionsWithExtraData = (collections) => {
  return collections.map((c) => {
    if (c.collectionIdentifier) {
      return c
    }

    let resourceType = getResourceType(c.type)
    let contract = c.path.replace("/public/", "")
    let contractName = contract
    if (resourceType != "AnyResource") {
      contract = getContract(resourceType)
      let comps = contract.split(".")
      contractName = comps[comps.length - 1]
    }

    return { ...c, contract: contract, contractName: contractName }
  })
}

const collectionsWithCatalogInfo = (collections, nftCatalog) => {
  const catalogPathMap = {}
  for (const [collectionID, catalog] of Object.entries(nftCatalog)) {
    const publicPath = catalog.collectionData.publicPath
    catalogPathMap[`/${publicPath.domain}/${publicPath.identifier}`] = {
      collectionIdentifier: collectionID,
      catalog: catalog
    }
  }

  const newCollections = []
  for (let i = 0; i < collections.length; i++) {
    const collection = Object.assign({}, collections[i])
    const catalogInfo = catalogPathMap[collection.path]
    if (catalogInfo) {
      collection.collectionIdentifier = catalogInfo.collectionIdentifier
      collection.name = catalogInfo.catalog.collectionDisplay.name
      collection.squareImage = catalogInfo.catalog.collectionDisplay.squareImage
      collection.contractName = catalogInfo.catalog.contractName
      collection.contractAddress = catalogInfo.catalog.contractAddress
    }
    newCollections.push(collection)
  }
  return newCollections
}

export default function Collections(props) {
  const router = useRouter()
  const { account } = router.query

  const [collections, setCollections] = useState(null)
  const [collectionData, setCollectionData] = useState(null)
  const [currentPublicItems, setCurrentPublicItems] = useRecoilState(currentPublicItemsState)
  const [nftCatalog, setNftCatalog] = useRecoilState(nftCatalogState)

  useEffect(() => {
    if (!nftCatalog) {
      bulkGetNftCatalog().then((catalog) => {
        setNftCatalog(catalog)
      }).catch((e) => console.error(e))
    }
  }, [])

  useEffect(() => {
    if (account && isValidFlowAddress(account)) {
      if (!currentPublicItems || (currentPublicItems.length > 0 && currentPublicItems[0].address != account)) {
        bulkGetPublicItems(account).then((items) => {
          const orderedItems = items.sort((a, b) => a.path.localeCompare(b.path))
          setCurrentPublicItems(orderedItems)
        }).catch((e) => console.error(e))
      } else {
        setCollectionData(currentPublicItems.filter((item) => item.isCollectionCap && item.tokenIDs.length > 0))
      }
    }
  }, [currentPublicItems, account])

  useEffect(() => {
    if (collectionData && nftCatalog) {
      const newCollection =
        collectionsWithExtraData(collectionsWithCatalogInfo(collectionData, nftCatalog))
      setCollections(newCollection)
    }
  }, [collectionData, nftCatalog])

  if (!account) {
    return <></>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showCollections = () => {
    if (!collections) {
      return (
        <div className="flex w-full mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    } else {
      return (
        <>
          {
            collections.length > 0 ?
              collections.map((collection, index) => {
                return (
                  <CollectionView collection={collection} key={`${collection.path}_${index}`} />
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
          <div className="p-2 flex gap-x-2 justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {`Collections (${collections ? collections.length : 0})`}
            </h1>
            <label className={`hidden sm:block cursor-pointer text-black bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}>
              <a href={`${publicConfig.drizzleURL}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Create raffle
              </a>
            </label>
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