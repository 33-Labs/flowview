import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import Key from "../../../components/common/Key"
import Layout from "../../../components/common/Layout"
import Spinner from "../../../components/common/Spinner"
import { getKeys, getKeysWithSequenceNumber } from "../../../flow/scripts"
import { isValidFlowAddress } from "../../../lib/utils"

const keysFetcher = async (funcName, address) => {
  return await getKeys(address)
}

export default function Keys() {
  const router = useRouter()
  const { account } = router.query

  const [keys, setKeys] = useState(null)

  const { data: keysData, error: keysError } = useSWR(
    account && isValidFlowAddress(account) ? ["keysFetcher", account] : null, keysFetcher
  )

  console.log(keysError)

  useEffect(() => {
    if (keysData) {
      console.log("keysData", keysData)
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
              <Key key={`key_${key.keyIndex}_${index}`} keyItem={key} />
            )
          }) :
          <div className="flex mt-10 h-[200] text-gray-400 text-xl justify-center">
            There is nothing here
          </div>
        }
      </div>
    )
  }

  // hashAlgoString : "SHA2_256"
  // index : 0
  // publicKey : "ef699ce71f46354ed8b77056f8fbfec1688ff0265a83c2dc9834c154096f1cc9eafbe49fe4a3b6c2d143623fbd72dcb26df50131ae06c2adef1154e5a1ce9bba"
  // revoked : false
  // sequenceNumber : 587
  // signAlgoString : "ECDSA_secp256k1"
  // weight : 1000
  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        {showKeys()}
      </Layout>
    </div>
  )
}