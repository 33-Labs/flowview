import { CurrencyDollarIcon, GiftIcon, ShareIcon } from "@heroicons/react/outline"
import Decimal from "decimal.js"
import Image from "next/image"
import { useRouter } from "next/router"
import { useRecoilState } from "recoil"
import { getFlowverseLink, getImageSrcFromMetadataViewsFile, getRarityColor, getResourceType, isValidFlowAddress } from "../../lib/utils"
import NFTTransferModal from "./NFTTransferModal"
import {
  basicNotificationContentState,
  showBasicNotificationState,
  transactionStatusState,
  transactionInProgressState,
  showNftTransferState,
  showCreateListingState
} from "../../lib/atoms"
import publicConfig from "../../publicConfig"
import useSWR from "swr"
import { useSWRConfig } from 'swr'
import { useEffect, useState } from "react"
import { getExistingListings } from "../../flow/storefront_scripts"
import CreateListingModal from "../storefront/CreateListingModal"
import { buyItem, removeItem } from "../../flow/storefront_transactions"

const listingInfoFetcher = async (funcName, address, contractName, contractAddress, tokenId) => {
  const listings = await getExistingListings(address, contractName, contractAddress, tokenId)
  const sortedListings = listings.sort((a, b) => {
    return parseInt(b.listingResourceId) - parseInt(a.listingResourceId)
  })
  return sortedListings
}

const extractContractInfo = (metadata) => {
  if (!metadata) {
    return { contractName: null, contractAddress: null }
  }

  let collectionType = getResourceType(metadata.collectionData.providerLinkedType)
  let contractAddress = `0x${collectionType.split(".")[1]}`
  let contractName = collectionType.split(".")[2]
  return { contractName: contractName, contractAddress: contractAddress }
}

export default function NFTDetailView(props) {
  const router = useRouter()
  const { collection: collectionPath, token_id: tokenID } = router.query
  const { mutate } = useSWRConfig()
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [showNftTransfer, setShowNftTransfer] = useRecoilState(showNftTransferState)
  const [, setShowCreateListing] = useRecoilState(showCreateListingState)

  const { metadata, user, account } = props
  const { contractName, contractAddress } = extractContractInfo(metadata)

  const [listingInfo, setListingInfo] = useState(null)
  const { data: itemsData, error: itemsError } = useSWR(
    publicConfig.chainEnv == "mainnet" && account && isValidFlowAddress(account) && contractName && contractAddress ? ["listingInfoFetcher", account, contractName, contractAddress, tokenID] : null, listingInfoFetcher
  )

  useEffect(() => {
    if (!itemsData) return
    if (itemsData.length > 0) {
      setListingInfo(itemsData[0])
    } else {
      setListingInfo(null)
    }
  }, [itemsData])

  const getMediasView = (metadata) => {
    const medias = metadata.medias
    if (!medias || medias.items.length == 0) { return null }
    return (
      <div className="flex flex-col gap-y-4">
        <h1 className="shrink-0 text-xl sm:text-2xl font-bold text-gray-900">
          {`Medias (${medias.items.length})`}
        </h1>
        <div className="flex gap-x-3 gap-y-3 flex-wrap">
          {
            medias.items.map((item, index) => {
              const isImage = item.mediaType.includes("image/")
              const isVideo = item.mediaType.includes("video/")
              let imageSrc = ""
              if (isImage) {
                imageSrc = getImageSrcFromMetadataViewsFile(item.file)
              }
              return (
                <div key={`media-${index}`}>
                  {
                    isImage ?
                      <div className="w-64 shrink-0 shadow-md aspect-square rounded-2xl bg-white relative overflow-hidden ring-1 ring-black ring-opacity-5">
                        <Image className={"object-contain"} src={imageSrc} fill alt="" priority sizes="33vw" />
                      </div> : (
                        isVideo ?
                          <div className="w-64 shrink-0 shadow-md aspect-square rounded-2xl bg-white overflow-hidden ring-1 ring-black ring-opacity-5">
                            <video controls>
                              <source src={item.file.url} />
                            </video>
                          </div>
                          : null
                      )
                  }
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }

  const getEditionsView = (metadata) => {
    const editions = metadata.editions
    if (!editions || editions.infoList.length == 0) { return null }
    return (
      <div className="flex flex-col gap-y-4 py-4 px-2">
        <h1 className="shrink-0 text-xl sm:text-2xl font-bold text-gray-900">
          {`Editions (${editions.infoList.length})`}
        </h1>
        <div className="flex flex-col gap-y-2">
          {
            editions.infoList.map((edition, index) => {
              return (
                <div className="flex gap-x-1" key={`edition-${index}`}>
                  <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full bg-blue-100 text-blue-800`}>{`${edition.name} `}<span className="text-blue-300">&nbsp;|&nbsp;</span>{edition.max ? ` #${edition.number} / ${edition.max}` : `#${edition.number}`}</label>
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }

  const getRoyaltiesView = (metadata) => {
    const royalties = metadata.royalties
    if (!royalties || royalties.cutInfos.length == 0) { return null }
    return (
      <div className="flex flex-col gap-y-4 py-4 px-2">
        <h1 className="shrink-0 text-xl sm:text-2xl font-bold text-gray-900">
          {`Royalties (${royalties.cutInfos.length})`}
        </h1>
        <div className="flex flex-col w-full shrink-0">
          <div className="px-1 overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Cut
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Receiver
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {royalties.cutInfos.map((cut, index) => (
                      <tr key={`royalties-${index}`}>
                        <td className="py-4 px-3 text-sm font-bold">
                          {`${new Decimal(cut.cut).mul(100).toString()}%`}
                        </td>
                        <td className="px-3 py-4 text-sm text-black min-w-[140px]">
                          <button
                            onClick={() => {
                              router.push(`/account/${cut.receiver.address}`)
                            }}>
                            <label
                              className="cursor-pointer underline font-bold decoration-drizzle decoration-2"
                            >
                              {cut.receiver.address}
                            </label>
                          </button>
                        </td>
                        <td className="px-3 py-4 text-sm text-black min-w-[140px]">
                          {cut.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getTraitsView = (metadata) => {
    const traits = metadata.traits && metadata.traits.traits
    if (!traits || traits.length == 0) return null
    return (
      <div className="flex flex-col gap-y-4 py-4 px-2">
        <h1 className="shrink-0 text-xl sm:text-2xl font-bold text-gray-900">
          {`Traits (${traits.length})`}
        </h1>
        <div className="flex flex-wrap gap-x-2 gap-y-2">
          {
            traits.map((t) => {
              let tt = Object.assign({}, t)
              if (typeof t.value == "object") {
                tt.value = JSON.stringify(t.value)
              }
              return tt
            }).sort((a, b) => { return a.value.length - b.value.length }).map((trait, index) => {
              let rarityColor = null
              if (trait.rarity && trait.rarity.description) {
                rarityColor = getRarityColor(trait.rarity.description.toLowerCase())
              }
              return (
                <div key={`traits-${index}`} className="flex flex-col gap-y-1 px-3 py-2 bg-white rounded-xl overflow-hidden ring-1 ring-black ring-opacity-5">
                  <label className="font-semibold text-gray-600 text-center text-sm">{trait.name}</label>
                  <label className="text-center text-sm">{trait.value}</label>

                  {
                    // TODO: Score?
                    trait.rarity && trait.rarity.description ?
                      <div className="flex flex-col items-center mt-1">
                        <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full ${rarityColor}`}>{trait.rarity.description.toUpperCase()}</label>
                      </div>
                      : null
                  }
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }

  const getListingInfo = (listingInfo) => {
    if (!listingInfo) return null
    if (user && user.loggedIn && user.addr == account) {
      return (
        <div className="flex gap-x-2 items-center">
          <div className="w-[32px] h-[32px] relative">
            <Image src="/flow_logo.png" alt="" fill sizes="16vw" priority={true} />
          </div>
          <label className="font-semibold text-black text-3xl">{`${new Decimal(listingInfo.details.salePrice)}`}</label>
          <button
            className={`ml-3 text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm h-9 rounded-2xl font-semibold shrink-0`}
            disabled={transactionInProgress}
            onClick={async () => {
              if (!listingInfo) return
              await removeItem(listingInfo.listingResourceId, setTransactionInProgress, setTransactionStatus)
              mutate(["listingInfoFetcher", account, contractName, contractAddress, tokenID])
            }}
          >
            Remove
          </button>
        </div>
      )
    }
    return (
      <div className="flex gap-x-2 items-center">
        <div className="w-[32px] h-[32px] relative">
          <Image src="/flow_logo.png" alt="" fill sizes="16vw" priority={true} />
        </div>
        <label className="font-semibold text-black text-3xl">{`${new Decimal(listingInfo.details.salePrice)}`}</label>
        <button
          className={`ml-3 text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm h-9 rounded-2xl font-semibold shrink-0`}
          disabled={transactionInProgress}
          onClick={async () => {
            if (!listingInfo) return
            const collectionStoragePath = getCollectionStoragePath(metadata)
            const res = await buyItem(
              contractName, contractAddress, collectionStoragePath,
              listingInfo.listingResourceId, account, setTransactionInProgress, setTransactionStatus
            )
            if (res && res.status === 4) {
              router.push(`/account/${account}/collection/${collectionPath}`)
            }
          }}
        >
          Buy Now
        </button>
      </div>
    )
  }

  const getCollectionStoragePath = (metadata) => {
    const { domain, identifier } = metadata.collectionData.storagePath
    const collectionStoragePath = `/${domain}/${identifier}`
    return collectionStoragePath
  }

  const getCollectionPublicPath = (metadata) => {
    const { domain, identifier } = metadata.collectionData.publicPath
    const path = `/${domain}/${identifier}`
    return path
  }

  const getDisplayView = (metadata) => {
    const display = metadata.display
    if (!display) return null
    const collectionDisplay = metadata.collectionDisplay
    const serial = metadata.serial
    const rarity = metadata.rarity
    const soulbound = metadata.soulbound
    let rarityColor = null
    if (rarity && rarity.description) {
      rarityColor = getRarityColor(rarity.description.toLowerCase())
    }
    const externalURL = metadata.externalURL
    const imageSrc = getImageSrcFromMetadataViewsFile(display.thumbnail)
    return (
      <div className="w-full pb-4 pt-2 px-2 flex gap-x-5">
        <div className="w-96 shrink-0 shadow-md aspect-square flex justify-center rounded-2xl bg-white relative overflow-hidden ring-1 ring-black ring-opacity-5">
          <Image className={"object-contain"} src={imageSrc} fill alt="" priority sizes="33vw" />
        </div>
        <div className="w-full flex flex-col gap-y-2 justify-between">
          <div className="flex flex-col gap-y-2 items-start">
            {
              collectionDisplay ?
                <label className="font-semibold text-gray-500">{collectionDisplay.name}</label>
                : null
            }
            <div className="w-full flex gap-x-4 justify-between items-center">
              <label className="font-bold text-black text-3xl">{display.name}</label>
              <div className="flex gap-x-2 justify-between items-center">
                {
                  contractName ?
                    <a
                      href={getFlowverseLink(contractName)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="h-[32px] aspect-square shrink-0 relative">
                        <Image src={"/flowverse.png"} alt="" fill sizes="5vw" className="object-contain" />
                      </div>
                    </a> : null
                }

                {
                  user && user.loggedIn && user.addr === account && !listingInfo ?
                    <CurrencyDollarIcon className="shrink-0 w-[32px] h-[32px] p-2 rounded-full text-gray-700 bg-drizzle hover:bg-drizzle-dark"
                      onClick={async () => {
                        if (transactionInProgress) {
                          return
                        }

                        setShowCreateListing(true)
                      }} /> : null
                }
                {
                  user && user.loggedIn && user.addr === account ?
                    <GiftIcon className="shrink-0 w-[32px] h-[32px] p-2 rounded-full text-gray-700 bg-drizzle hover:bg-drizzle-dark"
                      onClick={async () => {
                        if (transactionInProgress) {
                          return
                        }

                        setShowNftTransfer(true)
                      }} /> : null
                }
                <ShareIcon className="shrink-0 w-[32px] h-[32px] p-2 rounded-full text-gray-700 bg-drizzle hover:bg-drizzle-dark"
                  onClick={async () => {
                    await navigator.clipboard.writeText(window.location.href)
                    setShowBasicNotification(true)
                    setBasicNotificationContent({ type: "information", title: "Link Copied!", detail: null })
                  }} />
              </div>

            </div>
            <div className="flex gap-x-1">
              {
                rarity && rarity.description ?
                  <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full ${rarityColor}`}>{`${rarity.description.toUpperCase()}`}</label>
                  : null
              }
              {
                serial ?
                  <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full bg-yellow-100 text-yellow-800`}>{`Serial: #${serial.number}`}</label>
                  : null
              }
              {
                soulbound ?
                  <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full bg-indigo-100 text-indigo-800`}>{`SoulBound`}</label>
                  : null
              }
            </div>

            <label className="text-black text-base">{display.description}</label>
          </div>
          <div className="flex flex-col gap-y-4">
            {
              getListingInfo(listingInfo)
            }
            {
              externalURL && externalURL.url ?
                <div className="font-semibold h-[24px]">
                  {`View on `}
                  <a href={externalURL.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-bold decoration-drizzle decoration-2"
                  >
                    {new URL(externalURL.url).hostname}
                  </a>
                </div>
                : <div className="h-[24px] invisible">Placeholder</div>
            }
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`w-full flex flex-col gap-y-1 pb-2 justify-between shrink-0 overflow-hidden`}>
        {
          !metadata || Object.keys(metadata).length == 0 ?
            <div className="w-full flex flex-col mt-10 h-[70px] text-gray-400 text-base justify-center items-center">
              <label>{`${collectionPath} #${tokenID}`}</label>
              <label>{`No metadata found`}</label>
            </div> :
            <>
              {getDisplayView(metadata)}
              {getTraitsView(metadata)}
              {getEditionsView(metadata)}
              {getRoyaltiesView(metadata)}
              {getMediasView(metadata)}
            </>
        }
        <NFTTransferModal
          tokenId={tokenID}
          collectionStoragePath={`/storage/${metadata.collectionData.storagePath.identifier}`}
          collectionPublicPath={`/public/${metadata.collectionData.publicPath.identifier}`}
        />
        <CreateListingModal
          account={account}
          tokenId={tokenID}
          collectionStoragePath={getCollectionStoragePath(metadata)}
          collectionPublicPath={getCollectionPublicPath(metadata)}
          contractName={contractName}
          contractAddress={contractAddress}
        />
      </div>
    </>
  )
}