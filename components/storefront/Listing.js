import Decimal from "decimal.js"
import { useRouter } from "next/router"
import { useRecoilState } from "recoil"
import {
  transactionStatusState,
  transactionInProgressState
} from "../../lib/atoms"
import { buyItem, removeItem } from "../../flow/storefront_transactions"
import { useSWRConfig } from "swr"
import Image from "next/image"
import { getCollectionStoragePath, getContractInfoFromTypeId, getImageSrcFromMetadataViewsFile, getRarityColor } from "../../lib/utils"
import { list } from "postcss"

const getPaymentTokenSymbol = (listing) => {
  const symbol = listing?.paymentTokenInfo?.symbol ?? "UNKN"
  return symbol.toUpperCase()
}

export default function Listing(props) {
  const { listing, typeId, user } = props
  const router = useRouter()
  const { account } = router.query
  const { mutate } = useSWRConfig()
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const symbol = getPaymentTokenSymbol(listing)
  const loggedIn = user && user.loggedIn && user.addr == account
  const display = listing.display

  const getListingView = (listing) => {
    if (!listing || !listing.display) {
      return null
    }

    const display = listing.display
    const rarity = listing.rarity
    const rarityColor = getRarityColor(rarity && rarity.description ? rarity.description.toLowerCase() : null)

    return (
      <>
        <div className="flex justify-center w-full rounded-t-2xl aspect-square bg-drizzle-ultralight relative overflow-hidden">
          <Image className={"object-contain"} src={getImageSrcFromMetadataViewsFile(display.thumbnail)} fill alt="" priority sizes="5vw" />
          {
            rarity ?
              <div className={`absolute top-2 px-2 ${rarityColor} rounded-full font-flow font-medium text-xs`}>
                {`${rarity.description}`.toUpperCase()}
              </div> : null
          }
        </div>
        <label className="px-3 py-1 max-h-[50px] break-words overflow-auto text-ellipsis font-flow font-semibold text-xs text-black">
          {`${display.name}`}
        </label>
      </>
    )
  }

  const getCustomIdView = (listing) => {
    if (!listing || !listing.details || !listing.details.customID) {
      return null
    }

    let customId = listing.details.customID
    if (customId == "flowverse-nft-marketplace") {
      customId = "flowverse"
    }
    return (
      <div className="px-2 shrink-0">
        <label className={`shrink-0 text-xs px-2 py-1 leading-3 rounded-full bg-green-100 text-green-800`}>
          {customId}
        </label>
      </div>
    )
  }

  const getContractInfo = (listing) => {
    if (!listing || !listing.details || !listing.details.nftType) {
      return null
    }

    let typeId = listing.details.nftType.typeID
    return getContractInfoFromTypeId(typeId)
  }

  const getButton = () => {
    if (user && user.loggedIn && user.addr == account) {
      return (<button
      className={`mb-1 text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-2 py-1 text-sm h-9 rounded-2xl font-semibold shrink-0`}
      disabled={transactionInProgress}
      onClick={async (event) => {
        event.stopPropagation()
        await removeItem(listing.listingResourceId, setTransactionInProgress, setTransactionStatus)
        mutate(["listingsFetcher", account])
      }}
    >
      Remove
    </button>)
    }

    const collectionStoragePath = getCollectionStoragePath(listing)
    const contractInfo = getContractInfo(listing)
    if (!contractInfo) {
      return null
    }

    const {contractName, contractAddress} = contractInfo

    return (
      <button
      className={`mb-1 text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm h-9 rounded-2xl font-semibold shrink-0`}
      disabled={transactionInProgress}
      onClick={async (event) => {
        event.stopPropagation()
        await buyItem(
          contractName, contractAddress, collectionStoragePath,
          listing.listingResourceId, account, setTransactionInProgress, setTransactionStatus
        )
        mutate(["listingsFetcher", account])
      }}
    >
      Buy Now
    </button>

    )
  }

  return (
    <div className={`h-80 w-36 bg-white rounded-2xl flex flex-col gap-y-1 pb-2 justify-between items-center shrink-0 overflow-hidden shadow-md ring-1 ring-black ring-opacity-5`}
      onClick={() => {
        router.push({
          pathname: `/account/[account]/collection/[path]/[tokenId]`,
          query: { account: account, path: listing.collectionData.storagePath.identifier, tokenId: listing.details.nftID}
        }, undefined, { shallow: true, scroll: false })
      }}>
      {getListingView(listing)}
      <label className="px-3 py-1 font-flow font-medium text-xs text-gray-400">
        {`#${listing.details.nftID}`}
      </label>
      <div className="flex flex-col gap-y-1">
        <div className="bg-gray-200 w-full h-[1px]"></div>
        {getCustomIdView(listing)}
        <label className="mt-2 mb-2 px-2 break-words overflow-hidden text-ellipsis font-flow font-semibold text-sm text-black">
          {`${new Decimal(listing.details.salePrice).toString()} ${symbol}`}
        </label>
        {getButton()}
      </div>

    </div>
  )
}