import Image from 'next/image'
import publicConfig from "../publicConfig"

export default function TokenList(props) {
  const { tokens } = props

  return (
    <div>
      {tokens.length > 0 ?
        <div className="mt-4 flex flex-col w-full shrink-0">
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
                    {tokens.map((token, index) => (
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
        </div> :
        <div className="flex mt-10 h-[70px] text-gray-400 text-base justify-center">
          Nothing found
        </div>}
    </div>
  )
}