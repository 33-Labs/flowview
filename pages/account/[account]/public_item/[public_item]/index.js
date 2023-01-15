import * as fcl from "@onflow/fcl"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Layout from "../../../../../components/common/Layout"
import Spinner from "../../../../../components/common/Spinner"
import { isValidFlowAddress } from "../../../../../lib/utils"
import Custom404 from "../../404"
import useSWR, { useSWRConfig } from "swr"
import ItemsView from "../../../../../components/common/ItemsView"
import { getPublicItems } from "../../../../../flow/scripts"
import ItemsDetailView from "../../../../../components/common/ItemsDetailView"
import { ArrowLeftIcon } from "@heroicons/react/outline"

const publicItemFetcher = async (funcName, address, pathID) => {
  const path = {domain: "public", identifier: pathID}
  const items = await getPublicItems(address, [path])
  return items
}

export default function PublicItemDetail(props) {
  const router = useRouter()
  const { account, public_item } = router.query

  const [user, setUser] = useState({ loggedIn: null })
  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  const { mutate } = useSWRConfig()

  const [item, setItem] = useState(null)
  const { data: itemsData, error: itemsError} = useSWR(
    account && isValidFlowAddress(account) && public_item ? ["publicItemFetcher", account, public_item] : null, publicItemFetcher
  )

  console.log(itemsError)
  console.log(itemsData)

  useEffect(() => {
    if (itemsData && itemsData.length == 1) {
      setItem(itemsData[0])
    }
  }, [itemsData])

  if (!account) {
    return <div className="h-screen"></div>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showItem = () => {
    if (!item) {
      if (itemsError) {
        return (<div className="flex w-full mt-10 h-[70px] text-gray-400 text-base justify-center">
          Nothing found
        </div>)
      }

      return (
        <div className="flex w-full mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    }

    return (
      <ItemsDetailView item={item} account={account} user={user} />
    )
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div className="flex w-full flex-col gap-y-3 overflow-auto">
        <button
            className="mb-2 self-start"
            onClick={() => {
              router.push({
                pathname: "/account/[account]/public_item",
                query: { account: account }
              }, undefined, { shallow: true, scroll: false })
            }}
          >
            <div className="flex gap-x-2 text-drizzle items-center">
              <ArrowLeftIcon className="h-5 w-5" />
              <label className="cursor-pointer">Public Items</label>
            </div>
          </button>

          <div className="p-2 flex flex-col gap-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              <span className="font-normal">{"/public"}</span>{`/${public_item}`}
            </h1>
          </div>
          <div className="px-2 py-2 overflow-x-auto h-screen w-full">
            <div className="inline-block min-w-full">
              <div className="flex flex-col gap-y-4">
                {showItem()}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  )
}