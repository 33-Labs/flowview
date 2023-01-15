import * as fcl from "@onflow/fcl"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import ItemsView from "../../../../components/common/ItemsView"
import Layout from "../../../../components/common/Layout"
import Spinner from "../../../../components/common/Spinner"
import { bulkGetPublicItems } from "../../../../flow/scripts"
import { getCapabilityRestrictions, getResourceType, isValidFlowAddress } from "../../../../lib/utils"
import Custom404 from "../404"
import { useRecoilState } from "recoil"
import { currentPublicItemsState } from "../../../../lib/atoms"

const analyzeItems = (items) => {
  const dangerousItems = []
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const restrictions = getCapabilityRestrictions(item.type)
    const resource = getResourceType(item.type)

    if (!restrictions || !resource) {
      continue
    }

    const provider = restrictions.find((r) => r.includes("Receiver"))
    if (provider) {
      dangerousItems.push({
        path: item.path,
        type: item.type,
        resource: resource,
        restrictions: restrictions,
        message: "Expose provider to public"
      })
    }
  }
  return dangerousItems
}

export default function PublicItem(props) {
  const router = useRouter()
  const { account } = router.query

  const [currentPublicItems, setCurrentPublicItems] = useRecoilState(currentPublicItemsState)
  const [user, setUser] = useState({ loggedIn: null })
  const [dangerousItems, setDangerousItems] = useState([])

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

  // useEffect(() => {
  //   if (!currentPublicItems) return
  //   setDangerousItems(analyzeItems(currentPublicItems))
  // }, [currentPublicItems])

  if (!account) {
    return <div className="h-screen"></div>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showItems = () => {
    if (!currentPublicItems) {
      return (
        <div className="flex w-full mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    }

    return (
      <>
        {currentPublicItems.length > 0 ?
          currentPublicItems.map((item, index) => {
            return (
              <ItemsView key={`privateItems-${index}`} item={item} account={account} user={user} />
            )
          }) :
          <div className="flex w-full mt-10 h-[70px] text-gray-400 text-base justify-center">
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
          <div className="p-2 flex flex-col gap-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {`Public Paths ${currentPublicItems ? `(${currentPublicItems.length})` : ""}`}
            </h1>
          </div>
          {/* {
            user && user.loggedIn && account && user.addr == account && dangerousItems && dangerousItems.length > 0 ?
            <div className="px-2 py-2 overflow-x-auto w-full">
            <div className="inline-block min-w-full">
              <div className="flex flex-col gap-y-2">
                  <div className="bg-rose-600 rounded-xl text-white px-3 py-2 w-full min-w-[1076px]">
                    These capabilities exposed `Provider` to public and might cause your funds to be lost!
                  </div>
                  {dangerousItems.map((item, index) => {
                    return (
                      <div className="bg-white border border-rose-600 rounded-xl text-black px-3 py-2">
                        {`${item.path}`}
                      </div>
                    )
                  })}
                </div>
            </div>
          </div> : null
          } */}

          <div className="px-2 py-2 overflow-x-auto h-screen w-full">
            <div className="inline-block min-w-full">
              <div className="flex flex-col gap-y-4">
                {showItems()}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  )
}