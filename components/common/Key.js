import { classNames } from "../../lib/utils"
import { useRecoilState } from "recoil"
import {
  transactionStatusState,
  transactionInProgressState,
  showAlertModalState,
  alertModalContentState
} from "../../lib/atoms"
import { useSWRConfig } from 'swr'
import { revokeKey } from "../../flow/transactions"

const getHashTagColor = (hashAlgo) => {
  const colorMap = {
    "SHA2_256": { bg: "bg-green-100", text: "text-green-800" },
    "SHA3_256": { bg: "bg-blue-100", text: "text-blue-800" }
  }
  return colorMap[hashAlgo] || { bg: "bg-gray-100", text: "bg-gray-800" }
}

const getSignTagColor = (signAlgo) => {
  const colorMap = {
    "ECDSA_secp256k1": { bg: "bg-indigo-100", text: "text-indigo-800" },
    "ECDSA_P256": { bg: "bg-purple-100", text: "text-purple-800" }
  }
  return colorMap[signAlgo] || { bg: "bg-gray-100", text: "bg-gray-800" }
}

const dataField = (title, value) => {
  return (
    <div className="flex flex-col gap-y-1">
      <div className="text-sm text-gray-500 whitespace-nowrap">{title}</div>
      <div className="text-lg font-bold whitespace-nowrap">{value}</div>
    </div>
  )
}

export default function Key(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [, setShowAlertModal] = useRecoilState(showAlertModalState)
  const [, setAlertModalContent] = useRecoilState(alertModalContentState)
  const { mutate } = useSWRConfig()

  const { keyItem: key, account: account, user: user } = props

  const hashTag = getHashTagColor(key.hashAlgoString)
  const signTag = getSignTagColor(key.signAlgoString)

  const getRevokeButton = () => {
    return (
      <button
        type="button"
        disabled={transactionInProgress}
        className={
          classNames(
            transactionInProgress ? "bg-red-400 text-white" : "text-white bg-red-600 hover:bg-red-800",
            `px-3 py-2 text-sm rounded-2xl font-semibold`
          )
        }
        onClick={async () => {
          setShowAlertModal(false)
          setAlertModalContent({
            title: "Attention Needed",
            content: "Revoked key can not be used for signing transactions, please make sure you know what you are doing",
            actionTitle: "REVOKE",
            action: async () => {
              await revokeKey(key.index, setTransactionInProgress, setTransactionStatus)
              mutate(["keysFetcher", account])
            }
          })
          setShowAlertModal(true)
        }}
      >
        REVOKE
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-y-3 p-4 shadow-md rounded-2xl bg-white">
      <div className="flex justify-between items-center">
        <div className="flex gap-x-1 items-center">
          <label className="font-bold text-xl">{`#${key.index}`}&nbsp;&nbsp;</label>
          <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full ${hashTag.bg} ${hashTag.text}`}>{key.hashAlgoString}</label>
          <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full ${signTag.bg} ${signTag.text}`}>{key.signAlgoString}</label>
          {
            key.revoked ?
              <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full text-white bg-red-600`}>{"Revoked"}</label>
              : null
          }
        </div>
        {
          (user && user.loggedIn && user.addr == account && !key.revoked) ? getRevokeButton() : null
        }
      </div>

      <div className="w-full border-b-2"></div>

      <div className="flex flex-col gap-y-1">
        <div className="text-sm text-gray-500 whitespace-nowrap">{"Public Key"}</div>
        <div className="mt-1">
          <textarea
            rows={4}
            name="publicKey"
            id="publicKey"
            className={classNames(
              key.revoked ? "bg-red-50 border-red-300" : "bg-drizzle-ultralight border-drizzle",
              "resize-none block w-full border-2 rounded-xl p-2 font-flow text-lg"
            )}
            disabled={true}
            value={key.publicKey}
            spellCheck={false}
          />
        </div>
      </div>
      <div className="flex gap-x-4 justify-start">
        {dataField("Sequence Number", `${key.sequenceNumber}`)}
        {dataField("Weight", `${key.weight} / 1000`)}
      </div>
    </div>
  )
}