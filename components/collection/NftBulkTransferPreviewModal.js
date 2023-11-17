import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useRecoilState } from "recoil"
import { transactionStatusState, transactionInProgressState, showNftBulkTransferPreviewState } from '../../lib/atoms'
import * as fcl from "@onflow/fcl";
import Image from "next/image"
import { getRarityColor, isValidFlowAddress, isValidPositiveFlowDecimals, isValidPositiveNumber, isValidUrl } from '../../lib/utils'
import { useRouter } from 'next/router'
import { useSWRConfig } from 'swr'
import { acceptOwnership, redeemAccount } from '../../flow/hc_transactions';
import { bulkTransferNft } from '../../flow/nft_transactions';

export default function NftBulkTransferPreviewModal(props) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { account: account, collection: collectionPath } = router.query
  const { selectedTokens, setSelectedTokens, collection } = props
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const [showNftBulkTransferPreview, setShowNftBulkTransferPreview] = useRecoilState(showNftBulkTransferPreviewState)

  useEffect(() => fcl.currentUser.subscribe(setUser), [])
  const [user, setUser] = useState({ loggedIn: null })

  const cancelButtonRef = useRef(null)

  const getPreviewList = () => {
    const tokenIds = Object.entries(selectedTokens).filter(([tokenId, properties]) => properties.isSelected && properties.recipient).map(([tokenId, selected]) => tokenId)
    const previewList = tokenIds.map((tokenId) => {
      const token = selectedTokens[tokenId]
      return {
        tokenId: tokenId,
        recipient: token.recipient,
        display: token.display
      }
    }).sort((a, b) => a.recipient.localeCompare(b.recipient))
    return previewList
  }

  const getPreviewView = () => {
    const previewList = getPreviewList()
    return (
      <div className='flex gap-x-3 p-4 overflow-auto'>
        {
          previewList.map((token, index) => {
            const display = token.display
            const rarityColor = getRarityColor(display.rarity ? display.rarity.toLowerCase() : null)
            return (
              <div key={`preview-${index}`} className='flex flex-col justify-between items-center gap-y-3 w-36'>
                <div className={`w-36 text-center bg-green-100 text-green-800 rounded-xl font-flow font-medium text-xs`}>
                  {`#${index + 1}`}
                </div>
                <div className={
                  `ring-1 ring-drizzle w-36 h-60 bg-white rounded-2xl flex flex-col gap-y-1 pb-2 justify-between items-center shrink-0 overflow-hidden shadow-md`
                }>
                  <div className="flex justify-center w-full rounded-t-2xl aspect-square bg-drizzle-ultralight relative overflow-hidden">
                    <Image className={"object-contain"} src={display.imageSrc || "/token_placeholder.png"} fill alt="" priority sizes="5vw" />
                    {
                      display.rarity ?
                        <div className={`absolute top-2 px-2 ${rarityColor} rounded-full font-flow font-medium text-xs`}>
                          {`${display.rarity}`.toUpperCase()}
                        </div> : null
                    }
                  </div>
                  <label className="px-3 max-h-12 break-words text-center overflow-hidden font-flow font-semibold text-xs text-black">
                    {`${display.name}`}
                  </label>
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex gap-x-1 justify-center items-center">
                      {
                        display.transferrable == true ? null :
                          <div className={`w-4 h-4 text-center bg-indigo-100 text-indigo-800 rounded-full font-flow font-medium text-xs`}>
                            {"S"}
                          </div>
                      }
                      <label className="font-flow font-medium text-xs text-gray-400">
                        {`#${display.tokenID}`}
                      </label>
                    </div>

                  </div>
                </div>
                <div className={`px-1 text-center bg-indigo-100 text-indigo-800 rounded-xl font-flow font-medium text-sm`}>
                  {token.recipient}
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }

  return (
    <Transition.Root show={showNftBulkTransferPreview.show} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => setShowNftBulkTransferPreview(prev => ({
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
          <div className="flex items-end sm:items-center justify-center min-h-full p-2 text-center sm:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="min-w-[320px] relative bg-white rounded-2xl p-4 text-left overflow-hidden shadow-xl transform transition-all sm:max-w-3xl sm:w-full sm:p-6">
                <div>
                  <div className="mt-3">
                    <Dialog.Title as="h3" className="text-xl leading-6 font-bold text-gray-900 mb-4">
                      NFT Bulk Transfer
                    </Dialog.Title>
                    <div className='flex flex-col gap-y-4'>
                      {getPreviewView()}
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    disabled={transactionInProgress}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-drizzle text-base font-medium text-black hover:bg-drizzle-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle sm:col-start-2 sm:text-sm disabled:bg-drizzle-light disabled:text-gray-500"
                    onClick={async () => {
                      setShowNftBulkTransferPreview(prev => ({
                        ...prev, show: false
                      }))

                      const publicPath = `/public/${collection.publicPathIdentifier}`
                      const storagePath = `/storage/${collection.storagePathIdentifier}`
                      const list = getPreviewList()
                      const tokenIds = list.map((token) => token.tokenId)
                      const recipients = list.map((token) => token.recipient)
                      await bulkTransferNft(recipients, tokenIds,
                        storagePath, publicPath,
                        setTransactionInProgress, setTransactionStatus
                      )
                      router.reload()
                    }}
                  >
                    {"Confirm"}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowNftBulkTransferPreview(prev => ({
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
