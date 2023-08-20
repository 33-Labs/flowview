import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useRecoilState } from "recoil"
import { showSetupDisplayState, transactionStatusState, transactionInProgressState } from '../../lib/atoms'
import * as fcl from "@onflow/fcl";
import { isValidFlowAddress, isValidPositiveFlowDecimals, isValidPositiveNumber, isValidUrl } from '../../lib/utils'
import { useRouter } from 'next/router'
import { useSWRConfig } from 'swr'
import { setupChildAccountDisplay, setupOwnedAccount, setupOwnedAccountAndPublishToParent } from '../../flow/hc_transactions';

export default function SetupDisplayModal(props) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { account } = props
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const [showSetupDisplay, setShowSetupDisplay] = useRecoilState(showSetupDisplayState)
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const thumbnailPlaceholder = "https://assets-global.website-files.com/5f734f4dbd95382f4fdfa0ea/6395e6749db8fe00a41cc279_flow-flow-logo.svg"
  const [thumbnail, setThumbnail] = useState(thumbnailPlaceholder)
  const [thumbnailError, setThumbnailError] = useState(null)

  useEffect(() => fcl.currentUser.subscribe(setUser), [])
  const [user, setUser] = useState({ loggedIn: null })

  const cancelButtonRef = useRef(null)

  return (
    <Transition.Root show={showSetupDisplay.show || false} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => setShowSetupDisplay(prevState => ({
        ...prevState, show: false
      }))}>
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
                    <Dialog.Title as="h3" className="text-xl leading-6 font-bold text-gray-900 mb-4">
                      {
                        showSetupDisplay.mode == "OwnedAccount" ?
                          "Setup OwnedAccount" : "Setup ChildAccount Display"
                      }
                    </Dialog.Title>
                    <div className='flex flex-col gap-y-4'>
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
                          Name
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            className={`bg-white block w-full font-flow text-base rounded-lg px-3 py-2 border
                            focus:border-drizzle-dark
                          outline-0 focus:outline-2 focus:outline-drizzle-dark 
                          placeholder:text-gray-300`}
                            placeholder="Account Name"
                            onChange={(e) => {
                              setName(e.target.value)
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
                          Description
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            name="desc"
                            id="desc"
                            className={`bg-white block w-full font-flow text-base rounded-lg px-3 py-2 border
                            focus:border-drizzle-dark
                          outline-0 focus:outline-2 focus:outline-drizzle-dark 
                          placeholder:text-gray-300`}
                            placeholder="This is the account description"
                            onChange={(e) => {
                              setDesc(e.target.value)
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
                          Thumbnail
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            name="thumbnail"
                            id="thumbnail"
                            className={`bg-white block w-full font-flow text-base rounded-lg px-3 py-2 border
                            focus:border-drizzle-dark
                          outline-0 focus:outline-2 focus:outline-drizzle-dark 
                          placeholder:text-gray-300`}
                            placeholder={thumbnailPlaceholder}
                            onChange={(e) => {
                              setThumbnailError(null)
                              if (e.target.value === "") {
                                return
                              }

                              if (!isValidUrl(e.target.value)) {
                                setThumbnailError("Invalid URL")
                                return
                              }
                              setThumbnail(e.target.value)
                            }}
                          />
                        </div>
                        {
                          thumbnailError ?
                            <label className='text-base text-red-600 mt-1'>{thumbnailError}</label> : null
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    disabled={transactionInProgress || thumbnailError || !name || !desc || !thumbnail}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-drizzle text-base font-medium text-black hover:bg-drizzle-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle sm:col-start-2 sm:text-sm disabled:bg-drizzle-light disabled:text-gray-500"
                    onClick={async () => {
                      if (!name || !desc || !thumbnail) {
                        return
                      }


                      if (showSetupDisplay.mode == "OwnedAccount") {
                        setShowSetupDisplay(prevState => ({
                          ...prevState, show: false
                        }))
                        await setupOwnedAccount(name, desc, thumbnail, setTransactionInProgress, setTransactionStatus)
                        mutate(["ownedAccountInfoFetcher", account])
                      } else if (showSetupDisplay.mode == "ChildAccount") {
                        setShowSetupDisplay(prevState => ({
                          ...prevState, show: false
                        }))
                        console.log("Setup Display")
                        await setupChildAccountDisplay(showSetupDisplay.childAddress, name, desc, thumbnail, setTransactionInProgress, setTransactionStatus)
                        mutate(["hcManagerInfoFetcher", account])
                      } 
                    }}
                  >
                    {"Confirm"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowSetupDisplay(prevState => ({
                      ...prevState, show: false
                    }))}
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
