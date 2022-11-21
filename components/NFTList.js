import { useState } from "react"
import Image from 'next/image'
import { getItemsInPage, getSquareImageSrc } from '../lib/utils'
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/solid"
import publicConfig from "../publicConfig"

export default function NFTList(props) {
  const { nfts } = props
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  return (
    <div className="p-2">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            {`NFTs (${nfts.length})`}
          </h1>
        </div>
      </div>

      {nfts.length > 0 ?
        <div className="mt-3 flex flex-col w-full">
          <div className="px-1 overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Collection
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Contract
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Token IDs
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {getItemsInPage(nfts, currentPage, pageSize).map((nft, index) => (
                      <tr key={`nfts-${index}`}>
                        <td className="py-4 px-3 text-sm">
                          <div className="flex items-center">
                            <div className="h-6 w-6 flex-shrink-0 relative">
                              <Image className="rounded-lg object-contain" src={nft.catalog ? getImageSrcFromMetadataViewsFile(nft.catalog.squareImage.file) : "/token_placeholder.png"} alt="" fill sizes="33vw" />
                            </div>
                            <div className="flex flex-col ml-2">
                              <label className="block font-bold text-base text-gray-900 break-words max-w-[300px] min-w-[60px]">{nft.collectionIdentifier || "Unknown"}</label>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-black min-w-[140px]">
                          <label>
                            <a
                              href={`${publicConfig.flowscanURL}/contract/${nft.contract}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline font-bold decoration-drizzle decoration-2">
                              {nft.contract}
                            </a>
                          </label>
                        </td>
                        <td className="px-3 py-4 text-sm text-black min-w-[140px]">
                          {nft.nftIDs.toString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {nfts.length > pageSize ?
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
                disabled={currentPage * pageSize >= nfts.length}
                onClick={() => {
                  if (currentPage * pageSize >= nfts.length) {
                    return
                  }
                  setCurrentPage(currentPage + 1)
                }}
              >
                <ArrowRightIcon className={`h-5 w-5 ${currentPage * pageSize >= nfts.length ? "text-gray-400" : "text-black"}`} />
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