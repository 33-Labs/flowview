import * as fcl from "@onflow/fcl"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import ItemsView from "../../../../../components/common/ItemsView"
import Layout from "../../../../../components/common/Layout"
import Spinner from "../../../../../components/common/Spinner"
import { isValidFlowAddress } from "../../../../../lib/utils"
import Custom404 from "../../404"
import { getHcManagerInfo, getOwnedAccountInfo } from "../../../../../flow/hc_scripts"
import { useRecoilState } from "recoil"
import { showRedeemAccountState, showSetupHcManagerState, transactionInProgressState, transactionStatusState } from "../../../../../lib/atoms"
import SetupDisplayModal from "../../../../../components/hybrid_custody/SetupDisplayModal"
import PublishToParentModal from "../../../../../components/hybrid_custody/PublishToParentModal"
import { setupOwnedAccount } from "../../../../../flow/hc_transactions"
import ParentView from "../../../../../components/hybrid_custody/ParentView"
import SetupHcManagerModal from "../../../../../components/hybrid_custody/SetupHcManagerModal"
import RedeemAccountModal from "../../../../../components/hybrid_custody/RedeemAccountModal"
import ChildView from "../../../../../components/hybrid_custody/ChildView"

const hcManagerInfoFetcher = async (funcName, address) => {
  return getHcManagerInfo(address)
}

export default function HybridCustodyManager(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [showSetupHcManager, setShowSetupHcManager] = useRecoilState(showSetupHcManagerState)
  const [showRedeemAccount, setShowRedeemAccount] = useRecoilState(showRedeemAccountState)

  const router = useRouter()
  const { account } = router.query

  const [hcManagerInfo, setHcManagerInfo] = useState(null)
  const [user, setUser] = useState({ loggedIn: null })

  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  const { data: itemsData, error: itemsError } = useSWR(
    account && isValidFlowAddress(account) ? ["hcManagerInfoFetcher", account] : null, hcManagerInfoFetcher
  )

  useEffect(() => {
    console.log(itemsData)
    if (itemsData) {
      setHcManagerInfo(itemsData)
    }
  }, [itemsData])

  if (!account) {
    return <div className="h-screen"></div>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showItems = () => {
    if (!hcManagerInfo) {
      return (
        <div className="flex w-full mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    }

    return (
      <>
        {hcManagerInfo && hcManagerInfo.childAccounts.length > 0 ?
          hcManagerInfo.childAccounts.map((item, index) => {
            return (
              <ChildView key={`child-${index}`} child={item} account={account} user={user} />
            )
          }) :
          <div className="flex w-full mt-10 h-[70px] text-gray-400 text-base justify-center">
            Nothing found
          </div>
        }
      </>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div className="flex w-full flex-col gap-y-3 overflow-auto">
          <div className="p-2 flex gap-x-2 justify-between w-full">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {`Children ${hcManagerInfo ? `(${hcManagerInfo.childAccounts.length})` : ""}`}
            </h1>
            <div className="flex gap-x-2 justify-end">
            {
                user && user.loggedIn && user.addr == account && hcManagerInfo && !hcManagerInfo.isManagerExists ?
                <button
                  className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
                  disabled={transactionInProgress}
                  onClick={async () => {
                    setShowSetupHcManager(true)
                  }}
                >
                  Setup Manager
                </button>
                : null
            }
            {
                user && user.loggedIn && user.addr == account && hcManagerInfo && hcManagerInfo.isManagerExists ?
                <button
                  className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
                  disabled={transactionInProgress}
                  onClick={async () => {
                    setShowRedeemAccount(true)
                  }}
                >
                  Redeem Account
                </button>
                : null
            }
            </div>
          </div>
          <div className="px-2 py-2 overflow-x-auto h-screen w-full">
            <div className="inline-block min-w-full">
              <div className="flex flex-col gap-y-4">
                {showItems()}
              </div>
            </div>
          </div>
        </div>
      </Layout>
      <SetupHcManagerModal />
      <RedeemAccountModal />
      <SetupDisplayModal />
    </div>
  )
}