import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useRecoilState } from "recoil"
import { transactionStatusState, transactionInProgressState, showNftBulkTransferState, showBulkTransferFormState, showNftBulkTransferPreviewState } from '../../lib/atoms'
import * as fcl from "@onflow/fcl";
import { getImageSrcFromMetadataViewsFile, isValidFlowAddress, isValidPositiveFlowDecimals, isValidPositiveNumber, isValidUrl } from '../../lib/utils'
import { useRouter } from 'next/router'
import { useSWRConfig } from 'swr'
import { acceptOwnership, redeemAccount } from '../../flow/hc_transactions';
import { bulkTransferNft } from '../../flow/nft_transactions';
import Decimal from 'decimal.js';
import { bulkGetNftViews, getNftViews } from '../../flow/scripts';

export default function BulkTransferFormModal(props) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { account: account, collection: collectionPath } = router.query
  console.log("collectionPath", collectionPath)
  const { selectedTokens, setSelectedTokens, collection } = props
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [rawRecordsStr, setRawRecordsStr] = useState('')
  const [recordsError, setRecordsError] = useState(null)
  const [showBulkTransferForm, setShowBulkTransferForm] = useRecoilState(showBulkTransferFormState)
  const [, setShowNftBulkTransferPreview] = useRecoilState(showNftBulkTransferPreviewState)

  useEffect(() => fcl.currentUser.subscribe(setUser), [])
  const [user, setUser] = useState({ loggedIn: null })

  const cancelButtonRef = useRef(null)

  const cleanStatus = () => {
    setRawRecordsStr('')
    setRecordsError(null)
  }

  const filterRecords = (rawRecordsStr) => {
    const rawRecords = rawRecordsStr.split("\n")

    let records = []
    let invalidRecords = []
    for (var i = 0; i < rawRecords.length; i++) {
      let rawRecord = rawRecords[i]
      const [tokenId, address] = rawRecord.split(",")
      console.log(tokenId)
      console.log(address)
      try {
        const id = new Decimal(tokenId)
        console.log("id decimap places", id.decimalPlaces())
        if (!id.isPositive() || id.decimalPlaces() > 0) { throw "invalid tokenId" }

        if (!isValidFlowAddress(address)) {
          throw "invalid address"
        }

        records.push({ id: i, address: address, tokenId: tokenId, rawRecord: rawRecord })
      } catch (e) {
        invalidRecords.push(rawRecord)
      }
    }
    return [records, invalidRecords]
  }

  const getImageSrc = (file) => {
    const src = getImageSrcFromMetadataViewsFile(file)
    if (src == "/token_placeholder.png") {
      return collection.squareImage ? getImageSrcFromMetadataViewsFile(collection.squareImage.file) : "/token_placeholder.png"
    }
    return src
  }

  return (
    <Transition.Root show={showBulkTransferForm.show} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => setShowBulkTransferForm(prev => ({
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
                      {showBulkTransferForm.mode == "NFT" ?
                        "NFT Bulk Transfer" : "Unknown"}
                    </Dialog.Title>
                    <div className='flex flex-col gap-y-4'>
                      <div>
                        <label htmlFor="factory" className="block text-sm font-medium leading-6 text-gray-900">
                          {`Token IDs and Recipients`}
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <textarea
                            rows={8}
                            name="records"
                            id="records"
                            className="p-1 rounded-md border focus:border-drizzle-dark outline-0 focus:outline-2 focus:outline-drizzle-dark  bg-drizzle/10 resize-none block w-full border-drizzle font-flow text-lg placeholder:text-gray-300"
                            value={rawRecordsStr}
                            spellCheck={false}
                            placeholder={
                              "12345,0xf8d6e0586b0a20c7"
                            }
                            disabled={transactionInProgress}
                            onChange={(event) => {
                              // if (validRecords.length > 0 || unpreparedRecords.length > 0 || invalidRecords.length > 0) {
                                // setValidRecords([])
                                // setInvalidRecords([])
                              // }
                              // setShowNotification(false)
                              setRawRecordsStr(event.target.value)
                            }}
                          />
                        </div>
                        {
                          recordsError ?
                            <label className='text-base text-red-600 mt-1'>{recordsError}</label> : null
                        }
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    disabled={transactionInProgress || !rawRecordsStr || rawRecordsStr.trim().length == 0}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-drizzle text-base font-medium text-black hover:bg-drizzle-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle sm:col-start-2 sm:text-sm disabled:bg-drizzle-light disabled:text-gray-500"
                    onClick={async () => {

                      if (showBulkTransferForm.mode == "NFT") {
                        const [records, invalidRecords] = filterRecords(rawRecordsStr.trim())
                        console.log(invalidRecords)
                        if (invalidRecords.length > 0) {
                          setRecordsError(`Some records are invalid`)
                          return
                        }

                        let tokenIds = []
                        let pairs = {}
                        for (var i = 0; i < records.length; i++) {
                          const record = records[i]
                          pairs[record.tokenId] = record.address
                          tokenIds.push(record.tokenId)
                        }

                        let displays = {}
                        try {
                          displays = await getNftViews(account, collectionPath, tokenIds)
                        } catch (e) {
                          console.log(e)
                          setRecordsError("Incorrect token id(s)")
                          return
                        }

                        let selected = {}
                        for (const [tokenId, display] of Object.entries(displays)) {
                          const recipient = pairs[tokenId]
                          const copyDisplay = Object.assign({}, display)
                          copyDisplay.imageSrc = getImageSrc(display.thumbnail)
                          copyDisplay.tokenID = tokenId
                          const properties = {
                            recipient: recipient,
                            isSelected: true,
                            display: copyDisplay,
                            selectedAt: 0
                          }
                          selected[tokenId] = properties
                        }

                        console.log("selectedTokens", selected)
                        setSelectedTokens(selected)
                        setShowBulkTransferForm(prev => ({
                          ...prev, show: false
                        }))

                        cleanStatus()

                        setShowNftBulkTransferPreview(prev => ({
                          ...prev, show: true
                        }))
                      }
                    }}
                  >
                    {"Confirm"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowBulkTransferForm(prev => ({
                      ...prev, show: false
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
