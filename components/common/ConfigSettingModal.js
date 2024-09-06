import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useRecoilState } from "recoil"
import { showConfigSettingState, transactionStatusState, transactionInProgressState } from '../../lib/atoms'
import * as fcl from "@onflow/fcl";
import { isValidFlowAddress } from '../../lib/utils'
import { useRouter } from 'next/router'
import { useSWRConfig } from 'swr'

export default function ConfigSettingModal(props) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { account } = props
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const [showConfigSetting, setShowConfigSetting] = useRecoilState(showConfigSettingState)

  const [hybridCustody, setHybridCustody] = useState(null)
  const [hybridCustodyError, setHybridCustodyError] = useState(null)

  const [nftStorefrontV2, setNftStorefrontV2] = useState(null)
  const [nftStorefrontV2Error, setNftStorefrontV2Error] = useState(null)

  useEffect(() => fcl.currentUser.subscribe(setUser), [])
  const [user, setUser] = useState({ loggedIn: null })

  useEffect(() => {
    fcl.config().get("0xHybridCustody", null).then((value) => {
      setHybridCustody(value)
    })

    fcl.config().get("0xNFTStorefrontV2", null).then((value) => {
      setNftStorefrontV2(value)
    })
  }, [])

  const cancelButtonRef = useRef(null)

  return (
    <Transition.Root show={showConfigSetting.show} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => setShowConfigSetting(prev => ({
        ...prev, show: false
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
                      {"Contract Addresses"}
                    </Dialog.Title>
                    <div className='flex flex-col gap-y-4'>
                      <div>
                        <div>
                          <label htmlFor="hybridCustody" className="block text-sm font-medium leading-6 text-gray-900">
                            HybridCustody Contracts
                          </label>
                          <label className='text-xs text-black'>Include HybridCustody, CapabilityFactory and CapabilityFilter</label>
                        </div>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            name="hybridCustody"
                            id="hybridCustody"
                            className={`bg-white block w-full font-flow text-base rounded-lg px-3 py-2 border
                            focus:border-drizzle-dark
                          outline-0 focus:outline-2 focus:outline-drizzle-dark 
                          placeholder:text-gray-300`}
                            placeholder="0x"
                            defaultValue={hybridCustody}
                            aria-describedby="price-currency"
                            onChange={(e) => {
                              setHybridCustodyError(null)
                              setHybridCustody(null)
                              if (e.target.value === "") {
                                return
                              }

                              if (!isValidFlowAddress(e.target.value)) {
                                setHybridCustodyError("Invalid address")
                                return
                              }
                              setHybridCustody(e.target.value)
                            }}
                          />
                        </div>
                        {
                          hybridCustodyError ?
                            <label className='text-base text-red-600 mt-1'>{hybridCustodyError}</label> : null
                        }
                      </div>

                      {/* <div>
                        <div>
                          <label htmlFor="hybridCustody" className="block text-sm font-medium leading-6 text-gray-900">
                            NFTStorefrontV2 Contract Address
                          </label>
                        </div>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            name="hybridCustody"
                            id="hybridCustody"
                            className={`bg-white block w-full font-flow text-base rounded-lg px-3 py-2 border
                            focus:border-drizzle-dark
                          outline-0 focus:outline-2 focus:outline-drizzle-dark 
                          placeholder:text-gray-300`}
                            placeholder="0x"
                            defaultChecked={nftStorefrontV2}
                            aria-describedby="price-currency"
                            onChange={(e) => {
                              setNftStorefrontV2Error(null)
                              setNftStorefrontV2(null)
                              if (e.target.value === "") {
                                return
                              }

                              if (!isValidFlowAddress(e.target.value)) {
                                setNftStorefrontV2Error("Invalid address")
                                return
                              }
                              setNftStorefrontV2(e.target.value)
                            }}
                          />
                        </div>
                        {
                          nftStorefrontV2Error ?
                            <label className='text-base text-red-600 mt-1'>{nftStorefrontV2Error}</label> : null
                        }
                      </div> */}
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    disabled={transactionInProgress}
                    className="w-full inline-flex justify-center rounded-md border border-transhybridCustody shadow-sm px-4 py-2 bg-drizzle text-base font-medium text-black hover:bg-drizzle-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle sm:col-start-2 sm:text-sm disabled:bg-drizzle-light disabled:text-gray-500"
                    onClick={async () => {
                      if (hybridCustody && hybridCustody != "") {
                        localStorage.setItem("0xHybridCustody", hybridCustody)
                      }

                      if (nftStorefrontV2 && nftStorefrontV2 != "") {
                        localStorage.setItem("0xNFTStorefrontV2", nftStorefrontV2)
                      }

                      fcl.config()
                        .put("0xHybridCustody", hybridCustody)
                        .put("0xCapabilityFactory", hybridCustody)
                        .put("0xCapabilityFilter", hybridCustody)
                        .put("0xCapabilityDelegator", hybridCustody)

                      showConfigSetting.callback()
                      setShowConfigSetting({show: false, callback: null})
                    }}
                  >
                    {"Confirm"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowConfigSetting({show: false, callback: null})}
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
