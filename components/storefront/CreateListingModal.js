import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useRecoilState } from "recoil"
import { showCreateListingState, transactionStatusState, transactionInProgressState } from '../../lib/atoms'
import * as fcl from "@onflow/fcl";
import { transferNft } from '../../flow/nft_transactions'
import { isValidFlowAddress, isValidPositiveFlowDecimals, isValidPositiveNumber } from '../../lib/utils'
import { useRouter } from 'next/router'
import { sellItem } from '../../flow/storefront_transactions';
import { useSWRConfig } from 'swr'

export default function CreateListingModal(props) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const {account, contractName, contractAddress, collectionStoragePath, collectionPublicPath, tokenId} = props
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const [showCreateListing, setShowCreateListing] = useRecoilState(showCreateListingState)
  const [priceInFlow, setPriceInFlow] = useState(null)
  const [priceInFlowError, setPriceInFlowError] = useState(null)
  const [expiry, setExpiry] = useState("30")
  const [expiryError, setExpiryError] = useState(null)

  useEffect(() => fcl.currentUser.subscribe(setUser), [])
  const [user, setUser] = useState({ loggedIn: null })

  const cancelButtonRef = useRef(null)

  return (
    <Transition.Root show={showCreateListing} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setShowCreateListing}>
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
                      {"Create Listing"}
                    </Dialog.Title>
                    <div className='flex flex-col gap-y-4'>
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
                          Price
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            name="price"
                            id="price"
                            className={`bg-white block w-full font-flow text-base rounded-lg px-3 py-2 border
                            focus:border-drizzle-dark
                          outline-0 focus:outline-2 focus:outline-drizzle-dark 
                          placeholder:text-gray-300`}
                            placeholder="0.00"
                            aria-describedby="price-currency"
                            onChange={(e) => {
                              setPriceInFlowError(null)
                              setPriceInFlow(null)
                              if (e.target.value === "") {
                                return
                              }

                              if (!isValidPositiveFlowDecimals(e.target.value)) {
                                setPriceInFlowError("Invalid price")
                                return
                              }
                              setPriceInFlow(e.target.value)
                            }}
                          />
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm" id="price-currency">
                              FLOW
                            </span>
                          </div>
                        </div>
                        {
                          priceInFlowError ?
                            <label className='text-base text-red-600 mt-1'>{priceInFlowError}</label> : null
                        }
                      </div>
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
                          Expiry
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            name="expiry"
                            id="expiry"
                            className={`bg-white block w-full font-flow text-base rounded-lg px-3 py-2 border
                            focus:border-drizzle-dark
                          outline-0 focus:outline-2 focus:outline-drizzle-dark 
                          placeholder:text-gray-300`}
                            placeholder="30"
                            onChange={(e) => {
                              setExpiryError(null)
                              setExpiry("30")
                              if (e.target.value === "") {
                                return
                              }

                              if (!isValidPositiveNumber(e.target.value)) {
                                setExpiryError("Invalid days")
                                return
                              }
                              setExpiry(e.target.value)
                            }}
                          />
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm" id="expiry-days">
                              DAYS
                            </span>
                          </div>
                          {
                            expiryError ?
                              <label className='text-base text-red-600 mt-1'>{expiryError}</label> : null
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    disabled={transactionInProgress || priceInFlowError || expiryError}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-drizzle text-base font-medium text-black hover:bg-drizzle-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle sm:col-start-2 sm:text-sm disabled:bg-drizzle-light disabled:text-gray-500"
                    onClick={async () => {
                      if (!account || !contractName || !contractAddress || !tokenId) {
                        return
                      }

                      setShowCreateListing(false)
                      await sellItem(
                        contractName, contractAddress, collectionStoragePath, collectionPublicPath, tokenId, priceInFlow, expiry,
                        setTransactionInProgress, setTransactionStatus
                      )
                      mutate(["listingInfoFetcher", account, contractName, contractAddress, tokenId])
                    }}
                  >
                    {"Confirm"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowCreateListing(false)}
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
