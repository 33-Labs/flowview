import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useRecoilState } from "recoil"
import { showPublishToParentState, transactionStatusState, transactionInProgressState } from '../../lib/atoms'
import * as fcl from "@onflow/fcl";
import { isValidFlowAddress, isValidPositiveFlowDecimals, isValidPositiveNumber, isValidUrl } from '../../lib/utils'
import { useRouter } from 'next/router'
import { useSWRConfig } from 'swr'
import { publishToParent, setupOwnedAccount, setupOwnedAccountAndPublishToParent } from '../../flow/hc_transactions';

export default function PublishToParentModal(props) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const {account} = props
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const [showPublishToParent, setShowPublishToParent] = useRecoilState(showPublishToParentState)

  const [parent, setParent] = useState("")
  const [parentError, setParentError] = useState(null)
  const [factory, setFactory] = useState("")
  const [factoryError, setFactoryError] = useState(null)
  const [filter, setFilter] = useState("")
  const [filterError, setFilterError] = useState(null)

  useEffect(() => fcl.currentUser.subscribe(setUser), [])
  const [user, setUser] = useState({ loggedIn: null })

  const cancelButtonRef = useRef(null)

  return (
    <Transition.Root show={showPublishToParent} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setShowPublishToParent}>
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
                      {"Publish To Parent"}
                    </Dialog.Title>
                    <div className='flex flex-col gap-y-4'>
                      <div>
                        <label htmlFor="parent" className="block text-sm font-medium leading-6 text-gray-900">
                          Parent Address
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            name="parent"
                            id="parent"
                            className={`bg-white block w-full font-flow text-base rounded-lg px-3 py-2 border
                            focus:border-drizzle-dark
                          outline-0 focus:outline-2 focus:outline-drizzle-dark 
                          placeholder:text-gray-300`}
                            placeholder="0x"
                            aria-describedby="price-currency"
                            onChange={(e) => {
                              setParentError(null)
                              setParent("")
                              if (e.target.value === "") {
                                return
                              }

                              if (!isValidFlowAddress(e.target.value)) {
                                setParentError("Invalid address")
                                return
                              }
                              setParent(e.target.value)
                            }}
                          />
                        </div>
                        {
                          parentError ?
                            <label className='text-base text-red-600 mt-1'>{parentError}</label> : null
                        }
                      </div>
                      <div>
                        <label htmlFor="factory" className="block text-sm font-medium leading-6 text-gray-900">
                          Factory Address
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            name="factory"
                            id="factory"
                            className={`bg-white block w-full font-flow text-base rounded-lg px-3 py-2 border
                            focus:border-drizzle-dark
                          outline-0 focus:outline-2 focus:outline-drizzle-dark 
                          placeholder:text-gray-300`}
                            placeholder="0x"
                            aria-describedby="price-currency"
                            onChange={(e) => {
                              setFactoryError(null)
                              setFactory("")
                              if (e.target.value === "") {
                                return
                              }

                              if (!isValidFlowAddress(e.target.value)) {
                                setFactoryError("Invalid address")
                                return
                              }
                              setFactory(e.target.value)
                            }}
                          />
                        </div>
                        {
                          factoryError ?
                            <label className='text-base text-red-600 mt-1'>{factoryError}</label> : null
                        }
                      </div>
                      <div>
                        <label htmlFor="filter" className="block text-sm font-medium leading-6 text-gray-900">
                          Filter Address
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            name="filter"
                            id="filter"
                            className={`bg-white block w-full font-flow text-base rounded-lg px-3 py-2 border
                            focus:border-drizzle-dark
                          outline-0 focus:outline-2 focus:outline-drizzle-dark 
                          placeholder:text-gray-300`}
                            placeholder="0x"
                            aria-describedby="price-currency"
                            onChange={(e) => {
                              setFilterError(null)
                              setFilter("")
                              if (e.target.value === "") {
                                return
                              }

                              if (!isValidFlowAddress(e.target.value)) {
                                setFilterError("Invalid address")
                                return
                              }
                              setFilter(e.target.value)
                            }}
                          />
                        </div>
                        {
                          filterError ?
                            <label className='text-base text-red-600 mt-1'>{filterError}</label> : null
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    disabled={transactionInProgress || parentError || filterError || factoryError || !parent || !filter || !factory}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-drizzle text-base font-medium text-black hover:bg-drizzle-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle sm:col-start-2 sm:text-sm disabled:bg-drizzle-light disabled:text-gray-500"
                    onClick={async () => {
                      if (!parent || !factory || !filter) {
                        return
                      }

                      setShowPublishToParent(false)
                      await publishToParent(parent, factory, filter, setTransactionInProgress, setTransactionStatus)
                      mutate(["ownedAccountInfoFetcher", account])
                    }}
                  >
                    {"Confirm"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowPublishToParent(false)}
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
