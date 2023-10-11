import { Fragment } from 'react'
import { Transition } from '@headlessui/react'
import {
  CheckCircleIcon,
  ClockIcon,
  InformationCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/outline'
import publicConfig from '../../publicConfig'

import { useRecoilState } from "recoil"
import {
  transactionInProgressState, transactionStatusState
} from "../../lib/atoms"

const NotificationContent = ({ txStatus }) => {
  if (txStatus.status == "Initializing") {
    return (
      <>
        <div className="flex-shrink-0">
          <ClockIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <div className="flex gap-x-2">
            <p className="text-sm font-bold font-flow text-gray-900">Initializing</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">Waiting for approval</p>
        </div>
      </>
    )
  }

  if (txStatus.status == "Pending") {
    return (
      <>
        <div className="flex-shrink-0">
          <InformationCircleIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <div className="flex gap-x-2">
            <p className="text-sm font-bold font-flow text-gray-900">Pending</p>
            <a
              href={`${publicConfig.flowscanURL}/tx/${txStatus.txid}`}
              rel="noopener noreferrer"
              target="_blank" className="truncate font-medium font-flow text-sm underline decoration-drizzle decoration-2">
              {`${txStatus.txid}`}
            </a >
          </div>
          <p className="mt-1 text-sm text-gray-500">Waiting for confirmation</p>
        </div>
      </>
    )
  }

  if (txStatus.status == "Success") {
    return (
      <>
        <div className="flex-shrink-0">
          <CheckCircleIcon className="h-6 w-6 text-drizzle" aria-hidden="true" />
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <div className="flex gap-x-2">
            <p className="text-sm font-bold font-flow text-gray-900">Success</p>
            <a
              href={`${publicConfig.flowscanURL}/tx/${txStatus.txid}`}
              rel="noopener noreferrer"
              target="_blank" className="truncate font-medium font-flow text-sm underline decoration-drizzle decoration-2">
              {`${txStatus.txid}`}
            </a >
          </div>
          <p className="mt-1 text-sm text-gray-500">Transaction successfully confirmed!</p>
        </div>
      </>
    )
  }

  if (txStatus.status == "Failed") {
    return (
      <>
        <div className="flex-shrink-0">
          <ExclamationCircleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
        </div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <div className="flex gap-x-2">
            <p className="text-sm font-bold font-flow text-gray-900">Failed</p>
            {
              txStatus.txid ? (
                <a
                  href={`${publicConfig.flowscanURL}/tx/${txStatus.txid}`}
                  rel="noopener noreferrer"
                  target="_blank" className="truncate font-medium font-flow text-sm underline decoration-drizzle decoration-2">
                  {`${txStatus.txid}`}
                </a>
              ) : null
            }
          </div>
          <p className="mt-1 text-sm text-gray-500 truncate">{
            typeof txStatus.error === "string" ? txStatus.error : txStatus.error.message
          }</p>
        </div>
      </>
    )
  }

  return (
    <>
    </>
  )
}
NotificationContent.displayName = "NotificationContent"

export default function TransactionNotification() {
  const [transactionInProgress,] = useRecoilState(transactionInProgressState)
  const [transactionStatus,] = useRecoilState(transactionStatusState)

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={transactionInProgress}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">
                  <NotificationContent txStatus={transactionStatus} />
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  )
}