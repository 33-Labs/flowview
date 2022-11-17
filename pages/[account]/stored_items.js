import { useEffect, useState } from "react"
import { SpinnerCircular } from "spinners-react"
import useSWR from "swr"
import ItemsView from "../../components/common/ItemsView"
import Layout from "../../components/common/Layout"
import { getItems } from "../../flow/scripts"

const storedItemsFetcher = async (funcName, address) => {
  return await getItems("storage", address)
}

export default function StoredItems(props) {
  const [storedItems, setStoredItems] = useState([])

  const account = props.user && props.user.addr

  const { data: itemsData, error: itemsError } = useSWR(
    account ? ["storedItemsFetcher", account] : null, storedItemsFetcher
  )

  useEffect(() => {
    if (itemsData) {
      setStoredItems(itemsData)
    }
  }, [itemsData])

  const showItems = () => {
    if (!itemsData) {
      return (
        <div className="flex mt-10 h-[200px] justify-center">
          <SpinnerCircular size={50} thickness={180} speed={100} color="#38E8C6" secondaryColor="#e2e8f0" />
        </div>
      )
    } else {
      return (
        <div className="flex flex-col gap-y-4">
          {
            storedItems.map((item) => {
              return (
                <ItemsView item={item} />
              )
            })
          }
        </div>
      )
    }
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        {showItems()}
      </Layout>
    </div>
  )
}