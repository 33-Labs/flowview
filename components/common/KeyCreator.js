import { useRecoilState } from "recoil"
import {
  transactionStatusState,
  transactionInProgressState,
  showBasicNotificationState,
  basicNotificationContentState
} from "../../lib/atoms"
import { useSWRConfig } from 'swr'
import { useState } from "react"
import OptionSelector from "./OptionSelector"
import { classNames, isValidPublicKey } from "../../lib/utils"
import Decimal from "decimal.js"
import { createKey } from "../../flow/transactions"

const hashAlgoOptions = [
  { id: 1, name: "SHA3_256", code: "3" },
  { id: 2, name: "SHA2_256", code: "1" }
]

const signAlgoOptions = [
  { id: 1, name: "ECDSA_P256", code: "1" },
  { id: 2, name: "ECDSA_secp256k1", code: "2" }
]

export default function KeyCreator(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const { mutate } = useSWRConfig()

  const { account: account, user: user } = props

  const [publicKey, setPublicKey] = useState("")
  const [weight, setWeight] = useState("1000")
  const [hashAlgo, setHashAlgo] = useState(hashAlgoOptions[0])
  const [signAlgo, setSignAlgo] = useState(signAlgoOptions[0])

  const getCreateButton = () => {
    return (
      <button
        type="button"
        disabled={transactionInProgress}
        className={
          classNames(
            transactionInProgress ? "bg-drizzle-light text-gray-500" : "text-black bg-drizzle hover:bg-drizzle-dark",
            `px-3 py-2 text-sm rounded-2xl font-semibold`
          )
        }
        onClick={async () => {
          if (!isValidPublicKey(publicKey)) {
            setShowBasicNotification(true)
            setBasicNotificationContent({ type: "exclamation", title: "Invalid Public Key", detail: null })
            return
          }

          if (weight.trim() == "" || new Decimal(weight).comparedTo(new Decimal(1000)) == 1) {
            setShowBasicNotification(true)
            setBasicNotificationContent({ type: "exclamation", title: "Invalid Weight", detail: null })
            return
          }

          await createKey(publicKey, signAlgo.code, hashAlgo.code, weight, setTransactionInProgress, setTransactionStatus)
          mutate(["keysFetcher", account])

          setPublicKey("")
          setWeight("1000")
          setSignAlgo(signAlgoOptions[0])
          setHashAlgo(hashAlgoOptions[0])
        }}
      >
        CREATE
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-y-3 p-4 shadow-md rounded-2xl bg-white">
      <div className="flex justify-between items-center">
        <label className="font-bold text-xl">{`Create New Key`}</label>
        {user && user.loggedIn && user.addr == account ? getCreateButton() : null}
      </div>
      <div className="w-full border-b-2"></div>

      <div className="flex flex-col gap-y-1">
        <div className="text-sm text-gray-500 whitespace-nowrap">{"Public Key"}</div>
        <div className="mt-1">
          <textarea
            rows={3}
            name="publicKeyInput"
            id="publicKeyInput"
            className={
              "bg-drizzle-ultralight border-drizzle resize-none block w-full border-2 rounded-xl p-2 font-flow text-lg focus:outline-none"
            }
            placeholder={
              "Your public key"
            }
            disabled={transactionInProgress}
            value={publicKey}
            spellCheck={false}
            onChange={(event) => {
              setPublicKey(event.target.value)
            }}
          />
        </div>
      </div>

      <div className="flex flex-row gap-x-4">
        <div className="flex flex-col gap-y-1">
          <div className="text-sm text-gray-500 whitespace-nowrap">{"Hash Algorithm"}</div>
          <OptionSelector options={hashAlgoOptions} selected={hashAlgo} setSelected={setHashAlgo} />
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="text-sm text-gray-500 whitespace-nowrap">{"Signature Algorithm"}</div>
          <OptionSelector options={signAlgoOptions} selected={signAlgo} setSelected={setSignAlgo} />
        </div>
        <div className="flex flex-col gap-y-1">
          <div className="text-sm text-gray-500 whitespace-nowrap">{"Weight"}</div>
          <div className="flex items-center gap-x-1 w-[140px]">
            <input
              type={`text`}
              name={`weight`}
              id={`weight`}
              disabled={transactionInProgress}
              placeholder={"Key Weight"}
              required
              className={classNames(
                `border-gray-500 border text-gray-900 bg-white block w-full font-flow text-sm rounded-lg px-3 py-2 focus:outline-none placeholder:text-gray-300`
              )}
              value={weight}
              onChange={(event) => {
                if (event.target.value === '' || /^(0|[1-9]\d*)$/.test(event.target.value)) {
                  setWeight(event.target.value)
                }
              }}
            />
            <label className="shrink-0 text-gray-500 text-sm">&nbsp;{`/ 1000`}</label>
          </div>
        </div>
      </div>
    </div>
  )
}