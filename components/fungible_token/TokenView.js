import { useRouter } from "next/router";
import publicConfig from "../../publicConfig";
import { useRecoilState } from "recoil";
import { transactionInProgressState, transactionStatusState } from "../../lib/atoms";
import { useSWRConfig } from "swr";
import { getContractLink } from "../../lib/utils";
import Image from "next/image";
import { addNewVault, removeVault } from "../../flow/switchboard_transactions";

export default function TokenView(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const { mutate } = useSWRConfig()

  const { token, account, isCurrentUser, switchboard } = props

  return (
    <div className="min-w-[500px] flex flex-col gap-y-3 p-4 shadow-md rounded-2xl bg-white">
      <div className="flex flex-col gap-y-3">

        <div className="flex gap-x-2 justify-between items-center">
          <div className="flex gap-x-2 items-center">
            <div className="h-10 w-10 flex-shrink-0 relative">
              <Image className="rounded-lg object-contain" src={token.logoURL || "/token_placeholder.png"} alt="" fill sizes="5vw" />
            </div>
            <div className="flex flex-col">
              <label className="block font-bold text-base text-gray-900 break-words max-w-[300px] min-w-[60px]">{token.symbol || token.contractName}</label>
              <div className="cursor-pointer text-xs text-black decoration-drizzle decoration-2 underline">
                <a href={getContractLink(token.contract)}
                  target="_blank"
                  rel="noopener noreferrer">
                  {token.contract}
                </a>
              </div>
            </div>
          </div>
          <label className="block font-bold text-base text-gray-900 break-words max-w-[300px] min-w-[60px]">{token.balance}</label>
        </div>

        {
          switchboard ?
            <div className="px-1 flex flex-col gap-y-1">
              <div className="bg-gray-200 w-full h-[1px]"></div>
              <label className="mt-2 block font-semibold text-sm text-gray-900">{`Switchboard`}</label>
              <div className="flex gap-x-3 justify-between items-center">
                {token.inSwitchboard ?
                  <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full bg-green-100 text-green-800`}>{"In Switchboard"}</label> :
                  <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full bg-yellow-100 text-yellow-800`}>{"Not In Switchboard"}</label>
                }

                <button
                  className={`${token.inSwitchboard ? "bg-yellow-400 disabled:bg-yellow-200 hover:bg-yellow-600" : "bg-drizzle disabled:bg-drizzle-light hover:bg-drizzle-dark"} text-black disabled:text-gray-500 px-3 py-2 text-xs rounded-2xl font-semibold shrink-0`}
                  disabled={transactionInProgress || !isCurrentUser}
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
              </div>
            </div> : null
        }
      </div>
    </div>
  )
}