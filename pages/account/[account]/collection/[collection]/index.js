import { ArrowLeftIcon, CodeIcon, GlobeAltIcon, ShareIcon } from "@heroicons/react/outline"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useRecoilState } from "recoil"
import Layout from "../../../../../components/common/Layout"
import NFTListView from "../../../../../components/common/NFTListView"
import Spinner from "../../../../../components/common/Spinner"
import { bulkGetNftCatalog, getStoredItems } from "../../../../../flow/scripts"
import { basicNotificationContentState, nftCatalogState, showBasicNotificationState, showBulkTransferFormState, showNftBulkTransferPreviewState, showNftBulkTransferState, transactionInProgressState } from "../../../../../lib/atoms"
import { classNames, collectionsWithCatalogInfo, collectionsWithDisplayInfo, collectionsWithExtraData, getContractLink, getFlowverseLink, getFlowtyLink, getImageSrcFromMetadataViewsFile, isValidFlowAddress } from "../../../../../lib/utils"
import publicConfig from "../../../../../publicConfig"
import Custom404 from "../../404"
import NftBulkTransferModal from "../../../../../components/collection/NftBulkTransferModal"
import * as fcl from "@onflow/fcl"
import NftBulkTransferPreviewModal from "../../../../../components/collection/NftBulkTransferPreviewModal"
import BulkTransferFormModal from "../../../../../components/collection/BulkTransferFormModal"

export default function CollectionDetail(props) {
  const router = useRouter()
  const { account: account, collection: collectionPath } = router.query
  const [transactionInProgress,] = useRecoilState(transactionInProgressState)
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [, setShowNftBulkTransfer] = useRecoilState(showNftBulkTransferState)
  const [, setShowBulkTransferForm] = useRecoilState(showBulkTransferFormState)
  const [, setShowNftBulkTransferPreview] = useRecoilState(showNftBulkTransferPreviewState)
  const [nftCatalog, setNftCatalog] = useRecoilState(nftCatalogState)
  const [collection, setCollection] = useState(null)
  const [collectionData, setCollectionData] = useState(null)
  const [collectionError, setCollectionError] = useState(null)
  const [needRelink, setNeedRelink] = useState(false)
  const [collectionDisplay, setCollectionDisplay] = useState(null)
  const [selectMode, setSelectMode] = useState("Detail")
  const [selectedTokens, setSelectedTokens] = useState({})

  const [user, setUser] = useState({ loggedIn: null })
  useEffect(() => fcl.currentUser.subscribe(setUser), [])

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
      const tempCollection = newCollections[0]
      const sortedIDs = tempCollection.tokenIDs.map((a) => BigInt(a)).sort((a, b) => {
        if (b - a > 0) {
          return 1
        } else if (b - a == 0) {
          return 0
        } else if (b - a < 0) {
          return -1
        }
      })
      tempCollection.tokenIDs = sortedIDs
      setCollection(tempCollection)
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
      return <Custom404 title={"Collection not found"} />
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
              <div className="h-screen">
                <NFTListView collection={collection} setNeedRelink={setNeedRelink} setCollectionDisplay={setCollectionDisplay}
                  selectMode={selectMode} selectedTokens={selectedTokens} setSelectedTokens={setSelectedTokens} />
              </div> :
              <div className="flex mt-10 h-[70px] text-gray-400 text-base justify-center">
                Nothing found
              </div>
          }
        </>
      )
    }
  }

  const getLinks = (linkSource) => {
    if (!linkSource) { return <div></div> }
    const externalURL = linkSource.externalURL
    let externalLink = null
    if (externalURL && externalURL.url.trim() != '') {
      externalLink = externalURL.url
    }

    const socials = linkSource.socials || {}
    const twitter = socials.twitter && socials.twitter.url.trim() != '' ? socials.twitter.url : null
    const discord = socials.discord && socials.discord.url.trim() != '' ? socials.discord.url : null

    return (
      <div className="flex gap-x-2">
        {
          <div>
            <ShareIcon className="w-[24px] p-1 rounded-full aspect-square text-gray-700 bg-drizzle hover:bg-drizzle-dark"
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href)
                setShowBasicNotification(true)
                setBasicNotificationContent({ type: "information", title: "Link Copied!", detail: null })
              }} />
          </div>
        }
        {
          linkSource.collectionIdentifier ?
            <a
              href={`${publicConfig.nftCatalogURL}/${collection.collectionIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="h-[24px] aspect-square shrink-0 relative">
                <Image src={"/nft-catalog.png"} alt="" fill sizes="5vw" className="object-contain" />
              </div>
            </a> : null
        }
        {externalLink ?
          <a
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <GlobeAltIcon className="h-[24px] aspect-square text-drizzle" />
          </a> : null}
        {twitter ?
          <a
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="h-[24px] aspect-square shrink-0 relative">
              <Image src={"/twitter.png"} alt="" fill sizes="5vw" className="object-contain" />
            </div>
          </a> : null}
        {discord ?
          <a
            href={discord}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="h-[24px] aspect-square shrink-0 relative">
              <Image src={"/discord.png"} alt="" fill sizes="5vw" className="object-contain" />
            </div>
          </a> : null}
      </div>
    )
  }

  const getContractInfoView = () => {
    if (collection && collection.addedCatalogInfo && collection.collectionIdentifier) {
      const contractName = collection.contractName
      const contractAddress = collection.contractAddress
      const publicPathIdentifier = collection.publicPathIdentifier
      return (
        <div className="px-1 mt-4 w-full flex justify-start items-center gap-x-2">
          <label className={`shrink-0 cursor-pointer font-bold text-xs px-2 py-1 leading-5 rounded-full bg-emerald-100 text-emerald-600`}
            onClick={() => {
              window.open(getContractLink(`A.${contractAddress.replace("0x", "")}.${contractName}`))
            }}
          >
            <span className="font-normal text-emerald-500">{`Contract Name: `}</span>
            {`${contractName}`}
          </label>
          <label className={`shrink-0 cursor-pointer font-bold text-xs px-2 py-1 leading-5 rounded-full bg-emerald-100 text-emerald-600`}
            onClick={() => {
              router.push(`/account/${contractAddress}`)
            }}><span className="font-normal text-emerald-500">{`Contract Address: `}</span>{`${contractAddress}`}</label>
          <label className={`shrink-0 font-bold text-xs px-2 py-1 leading-5 rounded-full bg-emerald-100 text-emerald-600`}><span className="font-normal text-emerald-500">{`PublicPath ID: `}</span>{`${publicPathIdentifier}`}</label>
        </div>
      )
    }

    return null
  }

  const getBasicInfoView = () => {
    let imageSrc = "/token_placeholder.png"
    let name = collectionPath
    let description = null
    let linkSource = null
    if (collection && collection.addedCatalogInfo && collection.collectionIdentifier) {
      imageSrc = getImageSrcFromMetadataViewsFile(collection.squareImage ? collection.squareImage.file : null)
      name = collection.name ? collection.name : collection.contractName
      description = collection.description
      linkSource = collection
    } else if (collectionDisplay) {
      imageSrc = getImageSrcFromMetadataViewsFile(collectionDisplay.squareImage ? collectionDisplay.squareImage.file : null)
      name = collectionDisplay.name
      description = collectionDisplay.description
      linkSource = collectionDisplay
    }

    // NOTE: Special case for flowmap
    if (collection && collection.path == '/storage/flowmapCollection') {
      imageSrc = '/flowmap.gif'
    }

    const isCurrentUser = () => {
      return user && user.loggedIn && user.addr == account
    }

    const disableBulkTransfer = () => {
      return !isCurrentUser() || transactionInProgress || Object.values(selectedTokens).filter((t) => t.isSelected).length == 0
    }

    const haveUnsetRecipient = () => {
      return Object.values(selectedTokens).filter((t) => t.isSelected && !t.recipient).length > 0
    }

    return (
      <div className="p-2 w-[calc(min(100vw,80rem)-160px)] sm:w-[calc(min(100vw,80rem)-192px)] overflow-auto">
        <div className="w-[1070px] flex gap-x-10 justify-between items-center">
          <div className="flex gap-x-3 items-center">
            <div className="h-[64px] w-[64px] shrink-0 relative rounded-full ring-1 ring-drizzle">
              <Image src={imageSrc} alt="" fill sizes="5vw" className="object-contain rounded-full" />
            </div>
            <div className="flex flex-col gap-y-1">
              <h1 className="shrink-0 text-xl sm:text-2xl font-bold text-gray-900">
                {`${name}`}
              </h1>
              <div className="cursor-pointer text-black text-xs mb-1 underline decoration-1 decoration-drizzle"
                onClick={() => {
                  router.push({
                    pathname: `/account/[account]/storage/[storage]`,
                    query: { account: account, storage: collectionPath }
                  }, undefined, { shallow: true, scroll: false })
                }}>{`/storage/`}<span className="font-bold">{`${collectionPath}`}</span></div>
            </div>
          </div>
          {getLinks(linkSource)}
        </div>
        {getContractInfoView()}
        <div className="px-1 py-2 w-[1070px]">{description}</div>
        <div className="mt-2 mb-4 flex gap-x-2 items-center">
        {
            collection && collection.contractName ?
              <a href={getFlowverseLink(collection.contractName)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0">
                <div className="flex items-center rounded-full ring-1 ring-drizzle px-2 py-1 text-xs sm:text-sm text-black">
                  <Image src="/flowverse.png" alt="" width={20} height={20} />&nbsp;Trade on Flowverse
                </div>
              </a> : null
        }
        {
            collection && collection.contractName && collection.contractAddress ?
              <a href={getFlowtyLink(collection.contractAddress, collection.contractName)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0">
                <div className="flex items-center rounded-full ring-1 ring-drizzle px-2 py-1 text-xs sm:text-sm text-black">
                  <Image className="rounded-full" src="/flowty.jpg" alt="" width={20} height={20} />&nbsp;Trade on Flowty
                </div>
              </a> : null
          }
          {
            linkSource && linkSource.uuid ?
              <a href={getContractLink(linkSource.uuid)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0">
                <div className="flex items-center rounded-full ring-1 ring-drizzle px-2 py-1 text-xs sm:text-sm text-black">
                  <Image src="/contractbrowser.png" alt="" width={20} height={20} />&nbsp;Browse Code on ContractBrowser
                </div>
              </a> : null
          }
        </div>
        <div className="bg-gray-200 w-full h-[1px]"></div>
        <div className="mt-4 mb-2 flex gap-x-2 items-center">
          <button
            type="button"
            disabled={!isCurrentUser() || transactionInProgress}
            className={
              classNames(
                !isCurrentUser() || transactionInProgress ? "bg-drizzle-light text-gray-500" : "text-black bg-drizzle hover:bg-drizzle-dark",
                `px-3 py-1 text-sm rounded-2xl font-semibold shrink-0`
              )
            }
            onClick={async () => {
              setShowBulkTransferForm({ show: true, mode: "NFT"})
            }}
          >
            Bulk Transfer(Pairs)
          </button>
          <div className="bg-gray-200 h-6 w-[1px]"></div>
          <button
            type="button"
            disabled={!isCurrentUser() || transactionInProgress}
            className={
              classNames(
                !isCurrentUser() || transactionInProgress ? "bg-drizzle-light text-gray-500" : "text-black bg-drizzle hover:bg-drizzle-dark",
                `px-3 py-1 text-sm rounded-2xl font-semibold shrink-0`
              )
            }
            onClick={async () => {
              if (selectMode == "Detail") {
                setSelectMode("Select")
              } else {
                setSelectMode("Detail")
                setSelectedTokens({})
              }
            }}
          >
            {selectMode == "Detail" ? "Select" : "Cancel"}
          </button>
          {
            isCurrentUser() && selectMode == "Select" ?
              <button
                type="button"
                disabled={disableBulkTransfer() || !haveUnsetRecipient()}
                className={
                  classNames(
                    disableBulkTransfer() || !haveUnsetRecipient() ? "bg-drizzle-light text-gray-500" : "text-black bg-drizzle hover:bg-drizzle-dark",
                    `px-3 py-1 text-sm rounded-2xl font-semibold shrink-0`
                  )
                }
                onClick={async () => {
                  setShowNftBulkTransfer({ show: true, mode: "SetRecipient" })
                }}
              >
                Set Recipient
              </button>
              : null
          }
          {
            isCurrentUser() && selectMode == "Select" ?
              <button
                type="button"
                disabled={disableBulkTransfer()}
                className={
                  classNames(
                    disableBulkTransfer() ? "bg-drizzle-light text-gray-500" : "text-black bg-drizzle hover:bg-drizzle-dark",
                    `px-3 py-1 text-sm rounded-2xl font-semibold shrink-0`
                  )
                }
                onClick={async () => {
                  for (const [tokenId, properties] of Object.entries(selectedTokens)) {
                    if (properties.isSelected && !properties.recipient) {
                      setShowBasicNotification(true)
                      setBasicNotificationContent({ type: "exclamation", title: "Recipient not set", detail: "The recipient is not set for some selected NFTs." })
                      return
                    }
                  }
                  setShowNftBulkTransferPreview({ show: true, mode: "NftBulkTransfer" })
                }}
              >
                Bulk Transfer
              </button>
              : null
          }
          <a
            href="https://youtu.be/vf6JPmsO6NY?si=9A6tGTp4TTmMMg1d"
            target="_blank"
            rel="noopener noreferrer"
            className="font-flow text-sm whitespace-pre underline decoration-drizzle decoration-1 text-drizzle"
          >
            How do I transfer NFTs in bulk?
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div className="flex flex-col gap-y-3">
          <button
            className="mb-2 self-start"
            onClick={() => {
              router.push({
                pathname: "/account/[account]/collection",
                query: { account: account }
              }, undefined, { shallow: true, scroll: false })
            }}
          >
            <div className="flex gap-x-2 text-drizzle items-center">
              <ArrowLeftIcon className="h-5 w-5" />
              <label className="cursor-pointer">Collections</label>
            </div>
          </button>

          {getBasicInfoView()}

          <div className="w-[calc(min(100vw,80rem)-160px)] sm:w-[calc(min(100vw,80rem)-192px)] overflow-auto">
            {showCollection()}
          </div>
        </div>
      </Layout>
      <NftBulkTransferModal selectedTokens={selectedTokens} setSelectedTokens={setSelectedTokens} collection={collection} />
      <NftBulkTransferPreviewModal selectedTokens={selectedTokens} setSelectedTokens={setSelectedTokens} collection={collection} />
      <BulkTransferFormModal selectedTokens={selectedTokens} setSelectedTokens={setSelectedTokens} collection={collection} />
    </div>
  )
}