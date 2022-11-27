import * as fcl from "@onflow/fcl"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import ItemsView from "../../../components/common/ItemsView"
import Layout from "../../../components/common/Layout"
import Spinner from "../../../components/common/Spinner"
import { bulkGetStoredItems, getStoredItems } from "../../../flow/scripts"
import { isValidFlowAddress } from "../../../lib/utils"
import Custom404 from "./404"

const storedItemsFetcher = async (funcName, address) => {
  const items = await bulkGetStoredItems(address)
  return items.sort((a, b) => a.path.localeCompare(b.path))
}

export default function StoredItems(props) {
  const router = useRouter()
  const { account } = router.query

  const [storedItems, setStoredItems] = useState(null)
  const [user, setUser] = useState({ loggedIn: null })

  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  const { data: itemsData, error: itemsError } = useSWR(
    account && isValidFlowAddress(account) ? ["storedItemsFetcher", account] : null, storedItemsFetcher
  )

  useEffect(() => {
    if (itemsData) {
      const data = itemsData.sort((a, b) => a.path.localeCompare(b.path))
      setStoredItems(data)
    }
  }, [itemsData])

  if (!account) {
    return <></>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showItems = () => {
    if (!storedItems) {
      return (
        <div className="flex mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-y-4">
        {storedItems.length > 0 ?
          storedItems.map((item, index) => {
            return (
              <ItemsView key={`privateItems-${index}`} item={item} account={account} user={user} />
            )
          }) :
          <div className="flex mt-10 h-[70px] text-gray-400 text-base justify-center">
            Nothing found
          </div>
        }
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        {showItems()}
      </Layout>
    </div>
  )
}