import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { SpinnerCircular } from "spinners-react"
import useSWR from "swr"
import ItemsView from "../../components/common/ItemsView"
import Layout from "../../components/common/Layout"
import { getItems } from "../../flow/scripts"
import { isValidFlowAddress, getResourceType } from "../../lib/utils"
import Custom404 from "./404"

const publicItemsFetcher = async (funcName, address) => {
  return await getItems("public", address)
}

export default function PublicItems(props) {
  const router = useRouter()
  const { account } = router.query

  const [publicItems, setPublicItems] = useState(null)

  const { data: itemsData, error: itemsError } = useSWR(
    account && isValidFlowAddress(account) ? ["publicItemsFetcher", account] : null, publicItemsFetcher
  )

  useEffect(() => {
    if (itemsData) {
      const data = itemsData.sort((a, b) => a.path.localeCompare(b.path))
      setPublicItems(data)
    }
  }, [itemsData])

  if (!account) {
    return <></>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showItems = () => {
    if (!publicItems) {
      return (
        <div className="flex mt-10 h-[200px] justify-center">
          <SpinnerCircular size={50} thickness={180} speed={100} color="#38E8C6" secondaryColor="#e2e8f0" />
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-y-4">
        { publicItems.length > 0 ?
          publicItems.map((item, index) => {
            return (
              <ItemsView key={`publicItems-${index}`} item={item} />
            )
          }) : 
          <div className="flex mt-10 h-[200] text-gray-400 text-xl justify-center">
            There is nothing here
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