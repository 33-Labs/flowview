import Decimal from "decimal.js"
import Image from "next/image"
import { useEffect, useState } from "react"

// const getImageUrl = (listing) => {
//   const url = listing?.nft?.metadata?.imageUrl ?? "/token_placeholder.png"
//   return url
// }

const getPaymentTokenSymbol = (listing) => {
  const symbol = listing?.paymentTokenInfo?.symbol ?? "UNKN"
  return symbol.toUpperCase()
}

export default function Listing(props) {
  const { listing, typeId } = props
  const symbol = getPaymentTokenSymbol(listing)

  return (
    <div className={`w-36 h-24 bg-white rounded-2xl flex flex-col gap-y-1 pt-2 pb-2 justify-between items-center shrink-0 overflow-hidden shadow-md ring-1 ring-black ring-opacity-5`}>
      {/* <div className="flex justify-center w-full rounded-t-2xl aspect-square bg-drizzle-ultralight relative overflow-hidden">
        <Image className={"object-contain"} src={imageUrl} fill alt="" priority sizes="5vw" />
      </div> */}
      <label className="px-3 break-words overflow-hidden text-ellipsis font-flow font-medium text-xs text-gray-400">
        {`${typeId}`}
      </label>
      <label className="px-3 break-words overflow-hidden text-ellipsis font-flow font-semibold text-sm text-black">
        {`${new Decimal(listing.details.salePrice).toString()} ${symbol}`}
      </label>
      <label className="px-3 font-flow font-medium text-xs text-gray-500">
        {`#${listing.details.nftID}`}
      </label>
    </div>
  )
}