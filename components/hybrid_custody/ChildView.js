import { useRouter } from "next/router";
import publicConfig from "../../publicConfig";
import { useRecoilState } from "recoil";
import { showSetupDisplayState, transactionInProgressState, transactionStatusState } from "../../lib/atoms";
import { removeChildFromChild, setupChildAccountDisplay } from "../../flow/hc_transactions";
import { useSWRConfig } from "swr";

export default function ChildView(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [showSetupDisplay, setShowSetupDisplay] = useRecoilState(showSetupDisplayState)
  const { mutate } = useSWRConfig()

  const router = useRouter()
  const { child, account, user } = props

  return (
    <div className="min-w-[1076px] flex flex-col gap-y-3 p-4 shadow-md rounded-2xl bg-white">
      <div className="flex flex-col gap-y-2">
        <div className="flex gap-x-2 justify-between items-center">
          <div className="cursor-pointer px-2 text-xl font-bold text-black decoration-drizzle decoration-2 underline">
            <a href={`${publicConfig.appURL}//account/${child.address}`}
              target="_blank"
              rel="noopener noreferrer">
              {child.address}
            </a>
          </div>
          <div className="flex gap-x-2 justify-between">
            {/* <button
              type="button"
              disabled={transactionInProgress}
              className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
              onClick={async () => {
                // TODO: REMOVE CHILD
                mutate(["hcManagerInfoFetcher", account])
              }}
            >
              {"Set Manager Cap Filter"}
            </button> */}
            <button
              type="button"
              disabled={transactionInProgress}
              className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
              onClick={async () => {
                setShowSetupDisplay({ show: true, mode: "ChildAccount", childAddress: child.address })
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
        {
          child.display && child.display.name ?
            <div className="flex gap-x-2 items-center">
              <label className={`w-[54px] font-semibold text-xs px-2 py-1 text-center rounded-full text-black bg-drizzle`}>
                Name
              </label>
              <div className="text-gray-600 text-sm">{child.display.name}</div>
            </div> : null
        }
        {
          child.display && child.display.description ?
            <div className="flex gap-x-2 items-center">
              <label className={`w-[54px] font-semibold text-xs px-2 py-1 text-center rounded-full text-black bg-drizzle`}>
                Desc
              </label>
              <div className="text-gray-600 text-sm">{child.display.description}</div>
            </div> : null
        }
      </div>
    </div>
  )
}