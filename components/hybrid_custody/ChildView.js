import { useRouter } from "next/router";
import publicConfig from "../../publicConfig";
import { useRecoilState } from "recoil";
import { transactionInProgressState, transactionStatusState } from "../../lib/atoms";
import { removeChildFromChild } from "../../flow/hc_transactions";
import { useSWRConfig } from "swr";

export default function ChildView(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const { mutate } = useSWRConfig()

  const router = useRouter()
  const { child, account, user } = props

  return (
    <div className="min-w-[1076px] flex flex-col gap-y-3 p-4 shadow-md rounded-2xl bg-white">
      <div className="flex flex-col gap-y-2">
        <div className="flex gap-x-2 mb-2 justify-between items-center">
          <div className="cursor-pointer px-2 text-xl font-bold text-black decoration-drizzle decoration-2 underline">
            <a href={`${publicConfig.appURL}//account/${child.address}`}
              target="_blank"
              rel="noopener noreferrer">
              {child.address}
            </a>
          </div>
          <div className="flex gap-x-2 justify-between">
            <button
              type="button"
              disabled={transactionInProgress}
              className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
              onClick={async () => {
                // TODO: REMOVE CHILD
                mutate(["hcManagerInfoFetcher", account])
              }}
            >
              {"Set Manager Cap Filter"}
            </button>
            <button
              type="button"
              disabled={transactionInProgress}
              className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
              onClick={async () => {
                // TODO: REMOVE CHILD
                mutate(["hcManagerInfoFetcher", account])
              }}
            >
              {"Set Display"}
            </button>
            <button
              type="button"
              disabled={transactionInProgress}
              className={`text-white disabled:bg-red-400 disabled:text-white bg-red-600 hover:bg-red-800 px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
              onClick={async () => {
                // TODO: REMOVE CHILD
                mutate(["hcManagerInfoFetcher", account])
              }}
            >
              {"Remove"}
            </button>
          </div>
        </div>
        {/* <div className="flex gap-x-2 px-2 text-base font-semibold text-black">
          <div>Factory:&nbsp;
            <a
              href={`${publicConfig.appURL}/account/${child.childAccount.factory.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer decoration-drizzle decoration-2 underline">
              {`${child.childAccount.factory.address}`}
            </a>
          </div>
        </div>
        <div className="flex gap-x-2 px-2 text-base font-semibold text-black">
          <div>Filter:&nbsp;
            <a
              href={`${publicConfig.appURL}/account/${child.childAccount.filter.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer decoration-drizzle decoration-2 underline">
              {`${child.childAccount.filter.address}`}
            </a>
          </div>
        </div> */}
      </div>
    </div>
  )
}