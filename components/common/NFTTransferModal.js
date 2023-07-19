import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useRecoilState } from "recoil"
import { showNftTransferState, transactionStatusState, transactionInProgressState } from '../../lib/atoms'
import * as fcl from "@onflow/fcl";
import { transferNft } from '../../flow/nft_transactions'
import { isValidFlowAddress } from '../../lib/utils'
import { useRouter } from 'next/router'

export default function NFTTransferModal(props) {
  const router = useRouter()
  const { tokenId, collectionStoragePath, collectionPublicPath } = props
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [showNftTransfer, setShowNftTransfer] = useRecoilState(showNftTransferState)

  const [user, setUser] = useState({ loggedIn: null })
  const [recipient, setRecipient] = useState("")
  const [recipientError, setRecipientError] = useState(null)
  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  const cancelButtonRef = useRef(null)

  return (
    <Transition.Root show={showNftTransfer} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setShowNftTransfer}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-2 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="min-w-[320px] relative bg-white rounded-2xl p-4 text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mt-3">
                    <Dialog.Title as="h3" className="text-xl leading-6 font-bold text-gray-900">
                      {"Recipient"}
                    </Dialog.Title>
                    <div className='flex flex-col gap-y-2'>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className={`mt-4 bg-white block w-full font-flow text-base rounded-lg px-3 py-2 border
                        focus:border-drizzle-dark
                      outline-0 focus:outline-2 focus:outline-drizzle-dark 
                      placeholder:text-gray-300`}
                      defaultValue={recipient}
                        onChange={(event) => {
                          if (recipientError) { setRecipientError(null) }
                          setRecipient(event.target.value)
                        }}
                      />
                      {
                        recipientError ?
                        <label className='text-base text-red-600'>{recipientError}</label> : null
                      }
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    disabled={transactionInProgress}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-drizzle text-base font-medium text-black hover:bg-drizzle-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle sm:col-start-2 sm:text-sm"
                    onClick={async () => {
                      if (!isValidFlowAddress(recipient)) {
                        setRecipientError("Invalid address")
                        return
                      }

                      setShowNftTransfer(false)
                      const res = await transferNft(recipient, tokenId,
                        collectionStoragePath, collectionPublicPath,
                        setTransactionInProgress, 
                        setTransactionStatus
                      )
                      if (res && res.status === 4) {
                        const {account, collection} = router.query
                        router.push(`/account/${account}/collection/${collection}`)
                      }
                    }}
                  >
                    {"Confirm"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowNftTransfer(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
