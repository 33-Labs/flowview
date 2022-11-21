import { useRecoilState } from "recoil"
import {
  transactionStatusState,
  transactionInProgressState,
  showAlertModalState,
  alertModalContentState
} from "../../lib/atoms"
import { useSWRConfig } from 'swr'
import { useState } from "react"

export default function KeyCreator() {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [, setShowAlertModal] = useRecoilState(showAlertModalState)
  const [, setAlertModalContent] = useRecoilState(alertModalContentState)
  const { mutate } = useSWRConfig()

  const [publicKey, setPublicKey] = useState("")

  return (
    <div className="flex flex-col gap-y-3 p-4 shadow-md rounded-2xl bg-white">
      <div className="flex flex-col gap-y-1">
        <div className="text-sm text-gray-500 whitespace-nowrap">{"Public Key"}</div>
        <div className="mt-1">
          <textarea
            rows={4}
            name="publicKeyInput"
            id="publicKeyInput"
            className={
              "bg-drizzle-ultralight border-drizzle resize-none block w-full border-2 rounded-xl p-2 font-flow text-lg"
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
    </div>
  )
}