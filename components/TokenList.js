import { useEffect, useState } from "react"
import Image from 'next/image'
import { classNames, getItemsInPage } from '../lib/utils'
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/solid"
import publicConfig from "../publicConfig"
import Decimal from "decimal.js"
import { Switch } from "@headlessui/react"

export default function TokenList(props) {
  const { tokens } = props
  const [currentPage, setCurrentPage] = useState(1)
  const [hideZeroBalance, setHideZeroBalance] = useState(false)
  const [filteredTokens, setFilteredTokens] = useState([])

  useEffect(() => {
    if (hideZeroBalance) {
      setFilteredTokens(tokens.filter((t) => !(new Decimal(t.balance).isZero())))
    } else {
      setFilteredTokens(tokens)
    }
  }, [tokens, hideZeroBalance])

  const pageSize = 10

  return (
    <div className="p-2">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <div className="flex gap-x-1 justify-between">
            <h1 className="flex gap-x-2 text-2xl font-bold text-gray-900">
              {`Tokens (${filteredTokens.length})`}
              <div className="px-3 flex gap-x-2 items-center">
                <label className="block text-gray-600 text-base font-normal font-flow">
                  Hide 0 balance
                </label>
                <Switch
                  checked={hideZeroBalance}
                  onChange={async () => {
                    setHideZeroBalance(!hideZeroBalance)
                    setCurrentPage(1)
                  }}
                  className={classNames(
                    hideZeroBalance ? 'bg-drizzle' : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      hideZeroBalance ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    )}
                  />
                </Switch>
              </div>
            </h1>
            <div className="flex gap-x-1 items-center">
              <label className={`cursor-pointer text-black bg-flow hover:bg-green-500 px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}>
                <a href={`${publicConfig.bayouURL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Bulk transfer
                </a>
              </label>
              <label className={`cursor-pointer text-black bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}>
                <a href={`${publicConfig.drizzleURL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create airdrop
                </a>
              </label>
              <label className={`cursor-pointer text-white bg-increment hover:bg-blue-800 px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}>
                <a href={`${publicConfig.incrementURL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Trade at Increment
                </a>
              </label>
            </div>
          </div>

        </div>
      </div>

      {filteredTokens.length > 0 ?
        <div className="mt-3 flex flex-col w-full">
          <div className="px-1 overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Symbol
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Contract
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {getItemsInPage(filteredTokens, currentPage, pageSize).map((token, index) => (
                      <tr key={`tokens-${index}`}>
                        <td className="py-4 px-3 text-sm">
                          <div className="flex items-center">
                            <div className="h-6 w-6 flex-shrink-0 relative">
                              <Image className="rounded-lg object-contain" src={token.logoURL || "/token_placeholder.png"} alt="" fill sizes="10vw" />
                            </div>
                            <div className="flex flex-col ml-2">
                              <label className="block font-bold text-base text-gray-900 break-words max-w-[300px] min-w-[60px]">{token.symbol || token.contractName}</label>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-black min-w-[140px]">
                          <label>
                            <a
                              href={`${publicConfig.flowscanURL}/contract/${token.contract}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline font-bold decoration-drizzle decoration-2">
                              {token.contract}
                            </a>
                          </label>
                        </td>
                        <td className="px-3 py-4 text-sm text-black min-w-[140px]">
                          {token.balance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {filteredTokens.length > pageSize ?
            <div className="mt-2 flex justify-between">
              <button
                className="bg-gray-50 p-2 rounded-full overflow-hidden shadow ring-1 ring-black ring-opacity-5"
                disabled={currentPage == 1}
                onClick={() => {
                  if (currentPage == 1) { return }
                  setCurrentPage(currentPage - 1)
                }}
              >
                <ArrowLeftIcon
                  className={`h-5 w-5 ${currentPage == 1 ? "text-gray-400" : "text-black"}`}
                />
              </button>
              <button
                className="bg-gray-50 h-9 w-9 rounded-full overflow-hidden shadow ring-1 ring-black ring-opacity-5"
                disabled={true}
              >{currentPage}</button>
              <button
                className="bg-gray-50 p-2 rounded-full overflow-hidden shadow ring-1 ring-black ring-opacity-5"
                disabled={currentPage * pageSize >= filteredTokens.length}
                onClick={() => {
                  if (currentPage * pageSize >= filteredTokens.length) {
                    return
                  }
                  setCurrentPage(currentPage + 1)
                }}
              >
                <ArrowRightIcon className={`h-5 w-5 ${currentPage * pageSize >= filteredTokens.length ? "text-gray-400" : "text-black"}`} />
              </button>
            </div> : null
          }
        </div> :
        <div className="flex mt-10 h-[70px] text-gray-400 text-base justify-center">
          Nothing found
        </div>}
    </div>
  )
}