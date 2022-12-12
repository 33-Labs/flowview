import { ArrowLeftIcon, GlobeAltIcon } from "@heroicons/react/outline"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useRecoilState } from "recoil"
import Layout from "../../../../../components/common/Layout"
import NFTListView from "../../../../../components/common/NFTListView"
import Spinner from "../../../../../components/common/Spinner"
import { bulkGetNftCatalog, getStoredItems } from "../../../../../flow/scripts"
import { nftCatalogState } from "../../../../../lib/atoms"
import { collectionsWithCatalogInfo, collectionsWithDisplayInfo, collectionsWithExtraData, getImageSrcFromMetadataViewsFile, isValidFlowAddress, isValidStoragePath } from "../../../../../lib/utils"
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
  const [collectionError, setCollectionError] = useState(null)
  const [needRelink, setNeedRelink] = useState(false)
  const [collectionDisplay, setCollectionDisplay] = useState(null)

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
        if (items.length == 0) {
          setCollectionError("No Collection Found")
        } else if (!items[0].isNFTCollection) {
          setCollectionError("Not NFT Collection")
        } else {
          setCollectionData(items)
        }
      }).catch((e) => console.error(e))
    }
  }, [account])

  useEffect(() => {
    if (collectionData && collectionData.length > 0) {
      const newCollections =
        collectionsWithExtraData(collectionsWithDisplayInfo(collectionData))
      setCollection(newCollections[0])
    }
  }, [collectionData])

  useEffect(() => {
    if (nftCatalog && collection && !collection.addedCatalogInfo) {
      const newCollections = collectionsWithCatalogInfo([collection], nftCatalog)
      setCollection(newCollections[0])
    }
  }, [nftCatalog, collection])

  if (!account) {
    return <div className="h-screen"></div>
  }

  if (account && isValidFlowAddress(account)) {
    if (!collectionPath) {
      return <Custom404 title={"Collection not found 1"} />
    }
  } else {
    return <Custom404 title={"Account may not exist"} />
  }

  if (collectionError) {
    return <Custom404 title={collectionError} />
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
        <>
          {
            collection.tokenIDs.length > 0 ?
              <div className="p-2 w-full h-screen overflow-auto">
                <NFTListView collection={collection} setNeedRelink={setNeedRelink} setCollectionDisplay={setCollectionDisplay} />
              </div> :
              <div className="flex w-full mt-10 h-[70px] text-gray-400 text-base justify-center">
                Nothing found
              </div>
          }
        </>
      )
    }
  }

  const getSocials = (collectionDisplay) => {
    if (!collectionDisplay) { return <div></div> }
    const externalURL = collectionDisplay.externalURL
    let externalLink = null
    if (externalURL && externalURL.url.trim() != '') {
      externalLink = externalURL.url
    }

    const socials = collectionDisplay.socials || {}
    const twitter = socials.twitter && socials.twitter.url.trim() != '' ? socials.twitter.url : null
    const discord = socials.discord && socials.discord.url.trim() != '' ? socials.discord.url : null
    return (
      <div className="flex gap-x-1">
        {externalLink ?
          <a
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GlobeAltIcon className="h-[16px] w-[16px] text-drizzle" />
          </a> : null}
        {twitter ?
          <a
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="h-[16px] w-[16px] shrink-0 relative">
              <Image src={"/twitter.png"} alt="" fill sizes="10vw" className="object-contain" />
            </div>
          </a> : null}
        {discord ?
          <a
            href={discord}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="h-[16px] w-[16px] shrink-0 relative">
              <Image src={"/discord.png"} alt="" fill sizes="10vw" className="object-contain" />
            </div>
          </a> : null}
      </div>
    )
  }

  const getBasicInfoView = () => {
    let imageSrc = "/token_placeholder.png"
    let name = collectionPath
    let description = null
    let socialSource = null
    if (collectionDisplay) {
      imageSrc = getImageSrcFromMetadataViewsFile(collectionDisplay.squareImage.file)
      name = collectionDisplay.name
      description = collectionDisplay.description
      socialSource = collectionDisplay
    } else if (collection && collection.name) {
      imageSrc = getImageSrcFromMetadataViewsFile(collection.squareImage.file)
      name = collection.name
      description = collection.description
      socialSource = collection
    }

    return (
      <>
        <div className="flex gap-x-3 items-center">
          <div className="h-[64px] w-[64px] shrink-0 relative rounded-full ring-1 ring-drizzle">
            <Image src={imageSrc} alt="" fill sizes="10vw" className="object-contain rounded-full" />
          </div>
          <div className="flex flex-col gap-y-1">
            <h1 className="shrink-0 text-xl sm:text-2xl font-bold text-gray-900">
              {`${name}`}
            </h1>
            <label className="text-black text-xs mb-1">{`/storage/${collectionPath}`}</label>
            {getSocials(socialSource)}
          </div>
        </div>

        <label>{description}</label>
      </>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div className="flex w-full flex-col gap-y-3 overflow-auto">
          <div className="p-2 flex gap-x-2 justify-between w-full">
            <div className="flex flex-col gap-y-2 justify-center">
              <button
                className="mb-2"
                onClick={() => {
                  router.push({
                    pathname: "/account/[account]/collection",
                    query: { account: account }
                  }, undefined, { shallow: true, scroll: false })
                }}
              >
                <div className=" flex gap-x-2 text-drizzle items-center">
                  <ArrowLeftIcon className="h-5 w-5" />
                  <label className="cursor-pointer">Collections</label>
                </div>
              </button>
              {getBasicInfoView()}
            </div>


          </div>
          {showCollection()}
        </div>
      </Layout>
    </div>
  )
}