import * as fcl from "@onflow/fcl"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import ItemsView from "../../../components/common/ItemsView"
import Layout from "../../../components/common/Layout"
import Spinner from "../../../components/common/Spinner"
import { bulkGetPrivateItems } from "../../../flow/scripts"
import { isValidFlowAddress } from "../../../lib/utils"
import Custom404 from "./404"

const privateItemsFetcher = async (funcName, address) => {
  return bulkGetPrivateItems(address)
}

export default function PrivateItems(props) {
  const router = useRouter()
  const { account } = router.query

  const [privateItems, setPrivateItems] = useState(null)
  const [user, setUser] = useState({ loggedIn: null })

  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  const { data: itemsData, error: itemsError } = useSWR(
    account && isValidFlowAddress(account) ? ["privateItemsFetcher", account] : null, privateItemsFetcher
  )

  useEffect(() => {
    if (itemsData) {
      const data = itemsData.sort((a, b) => a.path.localeCompare(b.path))
      setPrivateItems(data)
    }
  }, [itemsData])

  if (!account) {
    return <></>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showItems = () => {
    if (!privateItems) {
      return (
        <div className="flex mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-y-4">
        {privateItems.length > 0 ?
          privateItems.map((item, index) => {
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