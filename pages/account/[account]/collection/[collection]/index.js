import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useRecoilState } from "recoil"
import CollectionDisplayView from "../../../../../components/common/CollectionDisplayView"
import Layout from "../../../../../components/common/Layout"
import NFTListView from "../../../../../components/common/NFTListView"
import NftListView from "../../../../../components/common/NFTListView"
import Spinner from "../../../../../components/common/Spinner"
import { bulkGetNftCatalog, getStoredItems } from "../../../../../flow/scripts"
import { nftCatalogState } from "../../../../../lib/atoms"
import { collectionsWithCatalogInfo, collectionsWithExtraData, isValidFlowAddress, isValidStoragePath } from "../../../../../lib/utils"
import publicConfig from "../../../../../publicConfig"
import Custom404 from "../../404"

export default function CollectionDetail(props) {
  const router = useRouter()
  const { account: account, collection: collectionPath } = router.query

  console.log("account", account)
  console.log("collectionPath", collectionPath)

  const [nftCatalog, setNftCatalog] = useRecoilState(nftCatalogState)
  const [collection, setCollection] = useState(null)
  const [collectionData, setCollectionData] = useState(null)
  const [isInvalidType, setIsInvalidType] = useState(null)
  const [needRelink, setNeedRelink] = useState(false)

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
      getStoredItems(account, [collectionPath]).then((items) => {
        console.log("items", items)
        if (!items[0].isNFTCollection) {
          setIsInvalidType(true) 
        } else {
          setCollectionData(items)
        }
      }).catch((e) => console.error(e))
    }
  }, [account])

  useEffect(() => {
    if (collectionData && nftCatalog) {
      const newCollections = 
        collectionsWithExtraData(collectionsWithCatalogInfo(collectionData, nftCatalog))
      console.log("newCollections", newCollections[0])
      // TODO: if not collection ?
      setCollection(newCollections[0])
    }
  }, [collectionData, nftCatalog])

  if (!account) {
    return <></>
  }

  if (account && isValidFlowAddress(account)) {
    if (!collectionPath) {
      return <Custom404 title={"Collection not found 1"} />
    }
  } else {
    return <Custom404 title={"Account may not exist"} />
  }

  if (isInvalidType) {
    return <Custom404 title={"Collection not found 2"} />
  }

  const showCollection = () => {
    if (!collection) {
      return (
        <div className="flex w-full mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    } else {
      return (
        <div className="p-2 w-full h-screen overflow-auto">
          <NFTListView collection={collection} setNeedRelink={setNeedRelink} />
        </div>
      )
    }
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        {showCollection()}
      </Layout>
    </div>
  )
}