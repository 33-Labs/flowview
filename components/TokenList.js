import Image from 'next/image'
import { getContractLink } from '../lib/utils'
import publicConfig from "../publicConfig"
import { useRecoilState } from "recoil"
import { transactionInProgressState, transactionStatusState } from '../lib/atoms'
import { addNewVault, removeVault } from '../flow/switchboard_transactions'
import { useSWRConfig } from 'swr'

export default function TokenList(props) {
  const { mutate } = useSWRConfig()
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const { tokens, switchboard, isCurrentUser, account } = props

  const inSwitchboard = (switchboard, token) => {
    if (!switchboard) return false
    for (let i = 0; i < switchboard.vaultTypes.length; i++) {
      let type = switchboard.vaultTypes[i]
      if (type.typeID.includes(token.contract)) {
        return true
      }
    }
    return false
  }

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
                      {
                        switchboard ?
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            In Switchboard?
                          </th> : null
                      }
                      {
                        switchboard && isCurrentUser ?
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Switchboard Action
                          </th> : null
                      }

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {tokens.map((token) => {
                      let newToken = Object.assign({}, token)
                      newToken.inSwitchboard = inSwitchboard(switchboard, token)
                      return newToken
                    }).map((token, index) => (
                      <tr key={`tokens-${index}`}>
                        <td className="py-4 px-3 text-sm">
                          <div className="flex items-center">
                            <div className="h-6 w-6 flex-shrink-0 relative">
                              <Image className="rounded-lg object-contain" src={token.logoURL || "/token_placeholder.png"} alt="" fill sizes="5vw" />
                            </div>
                            <div className="flex flex-col ml-2">
                              <label className="block font-bold text-base text-gray-900 break-words max-w-[300px] min-w-[60px]">{token.symbol || token.contractName}</label>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-black min-w-[140px]">
                          <label>
                            <a
                              href={getContractLink(token.contract)}
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
                        {
                          switchboard ?
                            <td className="px-3 py-4 text-sm text-black min-w-[140px]">
                              {token.inSwitchboard ?
                                <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full bg-green-100 text-green-800`}>{"YES"}</label> :
                                <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full bg-yellow-100 text-yellow-800`}>{"NO"}</label>
                              }
                            </td> : null
                        }
                        {
                          switchboard && isCurrentUser ?
                            <td className="px-3 py-4 text-sm text-black min-w-[140px]">
                              <button
                                className={`${token.inSwitchboard ? "bg-yellow-400 disabled:bg-yellow-200 hover:bg-yellow-600" : "bg-drizzle disabled:bg-drizzle-light hover:bg-drizzle-dark"} text-black disabled:text-gray-500 px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
                                disabled={transactionInProgress}
                                onClick={async () => {
                                  if (!account) return
                                  if (token.inSwitchboard) {
                                    await removeVault(token.path.receiver, setTransactionInProgress, setTransactionStatus)
                                  } else {
                                    await addNewVault(token.path.receiver, setTransactionInProgress, setTransactionStatus)
                                  }
                                  mutate(["switchboardFetcher", account])
                                }}
                              >
                                {
                                  token.inSwitchboard ? "Remove Vault" : "Add New Vault"
                                }
                              </button>
                            </td> : null
                        }
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