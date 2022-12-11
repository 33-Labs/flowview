import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useRecoilState } from "recoil"
import Layout from "../../../../../components/common/Layout"
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

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div>
          Hello
        </div>
      </Layout>
    </div>
  )
}