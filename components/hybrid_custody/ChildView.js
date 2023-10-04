import { useRouter } from "next/router";
import publicConfig from "../../publicConfig";
import { useRecoilState } from "recoil";
import { showSetManagerCapFilterState, showSetupDisplayState, transactionInProgressState, transactionStatusState } from "../../lib/atoms";
import { removeChildAccount, removeChildFromChild, setupChildAccountDisplay } from "../../flow/hc_transactions";
import { useSWRConfig } from "swr";
import OwnedDisplayView from "./OwnedDisplayView";
import SupportedTypesView from "./SupportedTypesView";
import FilterDetailsView from "./FilterDetailsView";

export default function ChildView(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [showSetupDisplay, setShowSetupDisplay] = useRecoilState(showSetupDisplayState)
  const [showSetManagerCapFilter, setShowSetManagerCapFilter] = useRecoilState(showSetManagerCapFilterState)
  const { mutate } = useSWRConfig()

  const router = useRouter()
  const { child, account, user } = props

  return (
    <div className="min-w-[1076px] flex flex-col gap-y-3 p-4 shadow-md rounded-2xl bg-white">
      <div className="flex flex-col gap-y-2">
        <div className="flex gap-x-2 justify-between items-center">
          <div className="cursor-pointer px-2 text-xl font-bold text-black decoration-drizzle decoration-2 underline">
            <a href={`${publicConfig.appURL}/account/${child.address}`}
              target="_blank"
              rel="noopener noreferrer">
              {child.address}
            </a>
          </div>
          <div className="flex gap-x-2 justify-between">
            <button
              type="button"
              disabled={transactionInProgress || !(user && user.loggedIn && user.addr == account)}
              className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
              onClick={async () => {
                setShowSetManagerCapFilter({show: true, mode: "ChildAccount", childAddress: child.address})
              }}
            >
              {"Set Manager Cap Filter"}
            </button>
            <button
              type="button"
              disabled={transactionInProgress || !(user && user.loggedIn && user.addr == account)}
              className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
              onClick={async () => {
                setShowSetupDisplay({ show: true, mode: "ChildAccount", childAddress: child.address })
              }}
            >
              {"Set Display"}
            </button>
            <button
              type="button"
              disabled={transactionInProgress || !(user && user.loggedIn && user.addr == account)}
              className={`text-white disabled:bg-red-400 disabled:text-white bg-red-600 hover:bg-red-800 px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
              onClick={async () => {
                await removeChildAccount(child.address, setTransactionInProgress, setTransactionStatus)
                mutate(["hcManagerInfoFetcher", account])
              }}
            >
              {"Remove"}
            </button>
          </div>
        </div>
        {
          child.display ?
            <OwnedDisplayView display={child.display} style={"Small"} type="Child" /> : null
        }
        {
          child.factorySupportedTypes ?
            <SupportedTypesView types={child.factorySupportedTypes} /> : null
        }
        {
          child.filterDetails ?
            <FilterDetailsView details={child.filterDetails} /> : null 
        }
        {
          child.managerFilterDetails ?
            <FilterDetailsView title="Manager Filter" details={child.managerFilterDetails} /> : null
        }
      </div>
    </div>
  )
}