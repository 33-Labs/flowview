import { CodeIcon } from "@heroicons/react/outline"
import * as fcl from "@onflow/fcl"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import Layout from "../../../../components/common/Layout"
import Spinner from "../../../../components/common/Spinner"
import { getContractNames } from "../../../../flow/scripts"
import { isValidFlowAddress } from "../../../../lib/utils"
import publicConfig from "../../../../publicConfig"
import Custom404 from "../404"

const contractsFetcher = async (funcName, address) => {
  const contracts = await getContractNames(address)
  return contracts
}

export default function Contract(props) {
  const router = useRouter()
  const { account } = router.query

  const [contracts, setContracts] = useState(null)
  const [user, setUser] = useState({ loggedIn: null })

  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  const { data: itemsData, error: itemsError } = useSWR(
    account && isValidFlowAddress(account) ? ["storedItemsFetcher", account] : null, contractsFetcher
  )

  console.log(itemsData)
  console.log(itemsError)

  useEffect(() => {
    if (itemsData) {
      const data = itemsData.sort((a, b) => a.localeCompare(b))
      setContracts(data)
    }
  }, [itemsData])

  if (!account) {
    return <div className="h-screen"></div>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showItems = () => {
    if (!contracts) {
      return (
        <div className="flex mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    }

    return (
      <>
        {contracts.length > 0 ?
          contracts.map((name, index) => {
            return (
              <div key={index} className="flex p-4 justify-between items-center shadow-md gap-x-8 rounded-2xl bg-white">
                <div className="flex flex-col">
                  <label className="font-bold text-lg">{name}</label>
                  <label className="text-gray-600">{`A.${account.replace("0x", "")}.${name}`}</label>
                </div>
                <div className="flex gap-x-3 items-center">
                  {
                    publicConfig.chainEnv == "mainnet" ?
                      <div className="cursor-pointer h-[28px] aspect-square shrink-0 relative"
                        onClick={(event) => {
                          window.open(`https://contractbrowser.com/A.${account.replace("0x", "")}.${name}`)
                          event.stopPropagation()
                        }}>
                        <Image src={"/contractbrowser.png"} alt="" fill sizes="5vw" className="object-contain" />
                      </div> : null
                  }
                  <div className="cursor-pointer h-[28px] aspect-square shrink-0 rounded-full bg-drizzle p-1"
                    onClick={(event) => {
                      window.open(`https://f.dnz.dev/${account}/${name}`)
                      event.stopPropagation()
                    }}>
                    <CodeIcon className="aspect-square text-black" />
                  </div>
                  <div className="cursor-pointer h-[28px] aspect-square shrink-0 relative"
                    onClick={(event) => {
                      window.open(`${publicConfig.flowscanURL}/contract/A.${account.replace("0x", "")}.${name}/overview`)
                      event.stopPropagation()
                    }}>
                    <Image src={"/flowscan.svg"} alt="" fill sizes="5vw" className="object-contain" />
                  </div>

                </div>
              </div>
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
            <div className="p-2 flex gap-x-2 justify-between w-full">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {`Contracts ${contracts ? `(${contracts.length})` : ""}`}
              </h1>
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