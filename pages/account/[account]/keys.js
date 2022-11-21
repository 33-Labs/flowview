import * as fcl from "@onflow/fcl"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import Key from "../../../components/common/Key"
import KeyCreator from "../../../components/common/KeyCreator"
import Layout from "../../../components/common/Layout"
import Spinner from "../../../components/common/Spinner"
import { getKeys, getKeysWithSequenceNumber } from "../../../flow/scripts"
import { isValidFlowAddress } from "../../../lib/utils"

const keysFetcher = async (funcName, address) => {
  return await getKeys(address)
}

export default function Keys(props) {
  const router = useRouter()
  const { account } = router.query

  const [keys, setKeys] = useState(null)
  const [user, setUser] = useState({loggedIn: null})

  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  const { data: keysData, error: keysError } = useSWR(
    account && isValidFlowAddress(account) ? ["keysFetcher", account] : null, keysFetcher
  )

  useEffect(() => {
    if (keysData) {
      setKeys(keysData)
    }
  }, [keysData])

  const showKeys = () => {
    if (!keys) {
      return (
        <div className="flex mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-y-4">
        {keys.length > 0 ?
          keys.map((key, index) => {
            return (
              <Key key={`key_${key.keyIndex}_${index}`} keyItem={key} account={account} user={user} />
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
        <div className="flex flex-col gap-y-4">
          {
            user && user.loggedIn && user.addr == account ?
              <KeyCreator account={account} user={user} />
              : null
          }
          {showKeys()}
        </div>
      </Layout>
    </div>
  )
}