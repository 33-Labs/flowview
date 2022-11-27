import * as fcl from "@onflow/fcl"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import ItemsView from "../../../components/common/ItemsView"
import Layout from "../../../components/common/Layout"
import Spinner from "../../../components/common/Spinner"
import { bulkGetPublicItems } from "../../../flow/scripts"
import { isValidFlowAddress } from "../../../lib/utils"
import Custom404 from "./404"
import { useRecoilState } from "recoil"
import { currentPublicItemsState } from "../../../lib/atoms"

export default function PublicItems(props) {
  const router = useRouter()
  const { account } = router.query

  const [currentPublicItems, setCurrentPublicItems] = useRecoilState(currentPublicItemsState)
  const [user, setUser] = useState({ loggedIn: null })

  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  useEffect(() => {
    if (account && isValidFlowAddress(account)) {
      if (!currentPublicItems || (currentPublicItems.length > 0 && currentPublicItems[0].address != account)) {
        setCurrentPublicItems(null)
        bulkGetPublicItems(account).then((items) => {
          const orderedItems = items.sort((a, b) => a.path.localeCompare(b.path))
          setCurrentPublicItems(orderedItems)
        })
      }
    }
  }, [currentPublicItems, account])

  if (!account) {
    return <></>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showItems = () => {
    if (!currentPublicItems) {
      return (
        <div className="flex mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-y-4">
        {currentPublicItems.length > 0 ?
          currentPublicItems.map((item, index) => {
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