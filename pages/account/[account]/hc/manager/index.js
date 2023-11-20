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
import { showConfigSettingState, showRedeemAccountState, showSetupHcManagerState, transactionInProgressState, transactionStatusState } from "../../../../../lib/atoms"
import SetupDisplayModal from "../../../../../components/hybrid_custody/SetupDisplayModal"
import PublishToParentModal from "../../../../../components/hybrid_custody/PublishToParentModal"
import { setupOwnedAccount } from "../../../../../flow/hc_transactions"
import ParentView from "../../../../../components/hybrid_custody/ParentView"
import SetupHcManagerModal from "../../../../../components/hybrid_custody/SetupHcManagerModal"
import RedeemAccountModal from "../../../../../components/hybrid_custody/RedeemAccountModal"
import ChildView from "../../../../../components/hybrid_custody/ChildView"
import OwnedView from "../../../../../components/hybrid_custody/OwnedView"
import TransferOwnershipModal from "../../../../../components/hybrid_custody/TransferOwnerShipModal"
import SetManagerCapFilterModal from "../../../../../components/hybrid_custody/SetManagerCapFilterModal"
import { CogIcon } from "@heroicons/react/outline"
import publicConfig from "../../../../../publicConfig"

const hcManagerInfoFetcher = async (funcName, address) => {
  return getHcManagerInfo(address)
}

export default function HybridCustodyManager(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [showSetupHcManager, setShowSetupHcManager] = useRecoilState(showSetupHcManagerState)
  const [showRedeemAccount, setShowRedeemAccount] = useRecoilState(showRedeemAccountState)
  const [, setShowConfigSetting] = useRecoilState(showConfigSettingState)

  const router = useRouter()
  const { account } = router.query

  const [hcManagerInfo, setHcManagerInfo] = useState(null)
  const [user, setUser] = useState({ loggedIn: null })
  const [hybridCustody, setHybridCustody] = useState(null)

  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  const { data: itemsData, error: itemsError } = useSWR(
    account && hybridCustody && isValidFlowAddress(account) ? ["hcManagerInfoFetcher", account] : null, hcManagerInfoFetcher
  )

  console.log(itemsError)

  useEffect(() => {
    if (publicConfig.chainEnv == "emulator") {
      const hc = localStorage.getItem("0xHybridCustody")
      if (hc && hc != "") {
        fcl.config()
          .put("0xHybridCustody", hc)
          .put("0xCapabilityFactory", hc)
          .put("0xCapabilityFilter", hc)
          .put("0xCapabilityDelegator", hc)
        setHybridCustody(hc)
      }
    } else {
      fcl.config().get("0xHybridCustody", null).then((value) => {
        if (value && value != "") {
          setHybridCustody(value)
        }
      })
    }
  }, [])

  useEffect(() => {
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

  const showChildAccounts = () => {
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

  const showOwnedAccounts = () => {
    if (!hcManagerInfo) {
      return (
        <div className="flex w-full mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    }

    return (
      <>
        {hcManagerInfo && hcManagerInfo.ownedAccounts.length > 0 ?
          hcManagerInfo.ownedAccounts.map((item, index) => {
            return (
              <OwnedView key={`child-${index}`} child={item} account={account} user={user} />
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
          <div className="sm:min-w-[1076px] p-2 flex gap-x-2 justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {`Accounts Manager`}
            </h1>
            <div className="hidden sm:flex gap-x-2 justify-end">
              {
                hcManagerInfo && !hcManagerInfo.isManagerExists ?
                  <button
                    className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
                    disabled={transactionInProgress || !(user && user.loggedIn && user.addr == account)}
                    onClick={async () => {
                      setShowSetupHcManager(true)
                    }}
                  >
                    Setup Manager
                  </button>
                  : null
              }
              {
                hcManagerInfo && hcManagerInfo.isManagerExists ?
                  <button
                    className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
                    disabled={transactionInProgress || !(user && user.loggedIn && user.addr == account)}
                    onClick={async () => {
                      setShowRedeemAccount({ show: true, mode: "RedeemAccount" })
                    }}
                  >
                    Redeem Account
                  </button>
                  : null
              }
              {
                hcManagerInfo && hcManagerInfo.isManagerExists ?
                  <button
                    className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
                    disabled={transactionInProgress || !(user && user.loggedIn && user.addr == account)}
                    onClick={async () => {
                      setShowRedeemAccount({ show: true, mode: "AcceptOwnership" })
                    }}
                  >
                    Accept Ownership
                  </button>
                  : null
              }
            </div>
          </div>

          <div className="px-2 py-2 overflow-x-auto h-screen w-full">
            <div className="inline-block min-w-full">
              {
                hybridCustody && hybridCustody != "" ?
                  <div className="flex flex-col gap-y-8">
                    <div className="flex flex-col gap-y-4">
                      <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                        {`ChildAccounts ${hcManagerInfo ? `(${hcManagerInfo.childAccounts.length})` : ""}`}
                      </h1>
                      <div className="flex flex-col gap-y-4">
                        {showChildAccounts()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-y-4">
                      <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                        {`OwnedAccounts ${hcManagerInfo ? `(${hcManagerInfo.ownedAccounts.length})` : ""}`}
                      </h1>
                      <div className="flex flex-col gap-y-4">
                        {showOwnedAccounts()}
                      </div>
                    </div>
                  </div> :
                  <div className="flex items-center gap-x-1">
                    <label>
                      The HybridCustody Contracts Address is not set. Please set it here:
                    </label>
                    <button
                      className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark w-9 h-9 p-2 text-sm rounded-full font-semibold shrink-0`}
                      disabled={transactionInProgress}
                      onClick={async () => {
                        setShowConfigSetting({show: true, callback: () => {
                          router.reload()
                        }})
                      }}
                    >
                      <CogIcon className="h-5 w-5 text-black" />
                    </button>
                  </div>
              }
            </div>
          </div>
        </div>
      </Layout>
      <SetupHcManagerModal />
      <RedeemAccountModal />
      <SetupDisplayModal />
      <SetManagerCapFilterModal />
      <TransferOwnershipModal />
    </div>
  )
}