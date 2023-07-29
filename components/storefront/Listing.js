import Decimal from "decimal.js"
import { useRouter } from "next/router"
import { useRecoilState } from "recoil"
import {
  transactionStatusState,
  transactionInProgressState
} from "../../lib/atoms"
import { removeItem } from "../../flow/storefront_transactions"
import { useSWRConfig } from "swr"

// const getImageUrl = (listing) => {
//   const url = listing?.nft?.metadata?.imageUrl ?? "/token_placeholder.png"
//   return url
// }

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

  return (
    <div className={`w-36 bg-white rounded-2xl flex flex-col gap-y-1 pt-2 pb-2 justify-between items-center shrink-0 overflow-hidden shadow-md ring-1 ring-black ring-opacity-5`}>
      {/* <div className="flex justify-center w-full rounded-t-2xl aspect-square bg-drizzle-ultralight relative overflow-hidden">
        <Image className={"object-contain"} src={imageUrl} fill alt="" priority sizes="5vw" />
      </div> */}
      <label className="mt-3 px-3 break-words overflow-hidden text-ellipsis font-flow font-medium text-xs text-gray-400">
        {`${typeId}`}
      </label>
      <label className="-mt-1 px-3 font-flow font-medium text-xs text-gray-400">
        {`#${listing.details.nftID}`}
      </label>
      <label className="mt-3 mb-3 px-3 break-words overflow-hidden text-ellipsis font-flow font-semibold text-sm text-black">
        {`${new Decimal(listing.details.salePrice).toString()} ${symbol}`}
      </label>
      {
        loggedIn ?
          <button
            className={`mb-3 text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm h-9 rounded-2xl font-semibold shrink-0`}
            disabled={transactionInProgress}
            onClick={async () => {
              await removeItem(listing.listingResourceId, setTransactionInProgress, setTransactionStatus)
              mutate(["listingsFetcher", account])
            }}
          >
            Remove
          </button>
          : null
      }
    </div>
  )
}