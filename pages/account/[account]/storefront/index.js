import { CodeIcon } from "@heroicons/react/outline"
import * as fcl from "@onflow/fcl"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import Layout from "../../../../components/common/Layout"
import Spinner from "../../../../components/common/Spinner"
import { isValidFlowAddress } from "../../../../lib/utils"
import publicConfig from "../../../../publicConfig"
import Custom404 from "../404"
import { getListings } from "../../../../flow/storefront_scripts"
import ListingGroup from "../../../../components/storefront/ListingGroup"
import { constSelector, useRecoilState } from "recoil"
import {
  transactionStatusState,
  transactionInProgressState
} from "../../../../lib/atoms"
import { cleanupGhosted, cleanupPurchased, cleanupExpired } from "../../../../flow/storefront_transactions"
import { useSWRConfig } from 'swr'

const listingsFetcher = async (funcName, address) => {
  const listings = await getListings(address)
  return listings
}

const groupListings = (listings) => {
  let grouped = listings.reduce((acc, listing) => {
    const typeId = listing.details.nftType.typeID
    if (!acc[typeId]) {
      acc[typeId] = [];
    }

    acc[typeId].push(listing)

    return acc
  }, {})

  for (let type in grouped) {
    grouped[type].sort((a, b) => b.listingResourceId.localeCompare(a.listingResourceId))
  }

  let sortedGroups = Object.keys(grouped)
    .sort()
    .map(key => grouped[key]);

  return sortedGroups
}

export default function Storefront(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const router = useRouter()
  const { account } = router.query
  const { mutate } = useSWRConfig()

  const [listings, setListings] = useState(null)
  const [listingGroups, setListingGroups] = useState(null)
  const [user, setUser] = useState({ loggedIn: null })

  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  const { data: itemsData, error: itemsError } = useSWR(
    account && isValidFlowAddress(account) ? ["listingsFetcher", account] : null, listingsFetcher
  )

  useEffect(() => {
    if (itemsData) {
      setListings(itemsData)
      const groupedListings = groupListings(itemsData.validItems)
      setListingGroups(groupedListings)
    }
  }, [itemsData])

  if (!account) {
    return <div className="h-screen"></div>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showItems = () => {
    if (itemsError) {
      return <div className="flex mt-10 h-[70px] text-gray-400 text-base justify-center">
        Nothing found
      </div>
    }

    if (!listingGroups) {
      return (
        <div className="flex mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    }

    return (
      <>
        {listingGroups.length > 0 ?
          listingGroups.map((listings, index) => {
            return (
              <ListingGroup key={`listing-groups-${index}`} listings={listings} />
            )
          }) :
          <div className="flex mt-10 h-[70px] text-gray-400 text-base justify-center">
            Nothing found
          </div>
        }
      </>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div className="flex w-full flex-col gap-y-3 overflow-auto">
          <div className="flex w-full flex-col gap-y-3 overflow-auto">

            <div className="p-x flex gap-x-5 justify-between w-full min-w-[1076px]">
              <div className="p-2 flex flex-col gap-y-2 justify-between w-full">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {`Listings (${listingGroups ? listingGroups.flat().length : 0})`}
                </h1>
                {
                  listings && listings.invalidItems.length > 0 ?
                    <label className="text-sm text-red-400">
                      {`There are ${listings.invalidItems.length} invalid listings, which are either ghosted, purchased, or expired.`}
                    </label> : null
                }
              </div>
              <div className="p-x flex gap-x-2 justify-end w-full">
                <button
                  className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm h-9 rounded-2xl font-semibold shrink-0`}
                  disabled={transactionInProgress}
                  onClick={async () => {
                    const ghostedIds = listings.invalidItems.filter(item => item.isGhosted && !item.isPurchased).map(item => item.listingResourceId)
                    await cleanupGhosted(account, ghostedIds, setTransactionInProgress, setTransactionStatus)
                    mutate(["listingsFetcher", account])
                  }}
                >
                  Cleanup Ghosted
                </button>
                <button
                  className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm h-9 rounded-2xl font-semibold shrink-0`}
                  disabled={transactionInProgress}
                  onClick={async () => {
                    const purchasedIds = listings.invalidItems.filter(item => item.isPurchased).map(item => item.listingResourceId)
                    await cleanupPurchased(account, purchasedIds, setTransactionInProgress, setTransactionStatus)
                    mutate(["listingsFetcher", account])
                  }}
                >
                  Cleanup Purchased
                </button>
                <button
                  className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm h-9 rounded-2xl font-semibold shrink-0`}
                  disabled={transactionInProgress}
                  onClick={async () => {
                    const itemCount = listings.validItems.length + listings.invalidItems.length - 1
                    await cleanupExpired(account, "0", `${itemCount}`, setTransactionInProgress, setTransactionStatus)
                    mutate(["listingsFetcher", account])
                  }}
                >
                  Cleanup Expired
                </button>
              </div>
            </div>

            <div className="px-2 py-2 overflow-x-auto h-screen w-full">
              <div className="inline-block min-w-full">
                <div className="flex flex-col gap-y-4">
                  {showItems()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  )
}