import { useRouter } from "next/router";
import publicConfig from "../../publicConfig";
import { useRecoilState } from "recoil";
import { transactionInProgressState, transactionStatusState } from "../../lib/atoms";
import { removeParentFromChild } from "../../flow/hc_transactions";
import { useSWRConfig } from "swr";

export default function ParentView(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const { mutate } = useSWRConfig()

  const router = useRouter()
  const { parent, account, user } = props

  return (
    <div className="min-w-[1076px] flex flex-col gap-y-3 p-4 shadow-md rounded-2xl bg-white">
      <div className="flex flex-col gap-y-2">
        {
          !parent.isClaimed ?
            <div>
              <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full bg-yellow-100 text-yellow-800`}>{"UNCLAIMED"}</label>
            </div>
            : <div>
              <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full bg-green-100 text-green-800`}>{"CLAIMED"}</label>
            </div>
        }
        <div className="flex gap-x-2 justify-between items-center">
          <div className="cursor-pointer px-2 text-xl font-bold text-black decoration-drizzle decoration-2 underline">
            <a href={`${publicConfig.appURL}//account/${parent.address}`}
              target="_blank"
              rel="noopener noreferrer">
              {parent.address}
            </a>
          </div>
          <div>
            <button
              type="button"
              disabled={transactionInProgress || !parent.isClaimed}
              className={`text-white disabled:bg-red-400 disabled:text-white bg-red-600 hover:bg-red-800 px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
              onClick={async () => {
                await removeParentFromChild(parent.address, setTransactionInProgress, setTransactionStatus)
                mutate(["ownedAccountInfoFetcher", account])
              }}
            >
              {"Remove"}
            </button>
          </div>
        </div>
        <div className="flex gap-x-2 px-2 text-base text-black">
          <div className="text-sm font-semibold text-black">Factory&nbsp;
            <a
              href={`${publicConfig.appURL}/account/${parent.childAccount.factory.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 text-sm font-medium cursor-pointer decoration-drizzle decoration-2 underline">
              {`${parent.childAccount.factory.address}`}
            </a>
          </div>
        </div>
        <div className="flex gap-x-2 px-2 text-base font-semibold text-black">
        <div className="text-sm font-semibold text-black">Filter&nbsp;
            <a
              href={`${publicConfig.appURL}/account/${parent.childAccount.filter.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 text-sm font-medium cursor-pointer decoration-drizzle decoration-2 underline">
              {`${parent.childAccount.filter.address}`}
            </a>
          </div>
        </div>
      </div>


    </div>

  )
}