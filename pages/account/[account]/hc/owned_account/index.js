import * as fcl from "@onflow/fcl"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import ItemsView from "../../../../../components/common/ItemsView"
import Layout from "../../../../../components/common/Layout"
import Spinner from "../../../../../components/common/Spinner"
import { isValidFlowAddress } from "../../../../../lib/utils"
import Custom404 from "../../404"
import { getOwnedAccountInfo } from "../../../../../flow/hc_scripts"
import { useRecoilState } from "recoil"
import { showConfigSettingState, showPublishToParentState, showSetupDisplayState, showTransferOwnershipState, transactionInProgressState, transactionStatusState } from "../../../../../lib/atoms"
import SetupDisplayModal from "../../../../../components/hybrid_custody/SetupDisplayModal"
import PublishToParentModal from "../../../../../components/hybrid_custody/PublishToParentModal"
import { setupOwnedAccount } from "../../../../../flow/hc_transactions"
import ParentView from "../../../../../components/hybrid_custody/ParentView"
import TransferOwnershipModal from "../../../../../components/hybrid_custody/TransferOwnerShipModal"
import publicConfig from "../../../../../publicConfig"
import OwnedDisplayView from "../../../../../components/hybrid_custody/OwnedDisplayView"
import { CogIcon } from "@heroicons/react/outline"

const ownedAccountInfoFetcher = async (funcName, address) => {
  return getOwnedAccountInfo(address)
}

export default function HybridCustodyOwnedAcct(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [showSetupDisplay, setShowSetupDisplay] = useRecoilState(showSetupDisplayState)
  const [showPublishToParent, setShowPublishToParent] = useRecoilState(showPublishToParentState)
  const [showTransferOwnership, setShowTransferOwnership] = useRecoilState(showTransferOwnershipState)
  const [, setShowConfigSetting] = useRecoilState(showConfigSettingState)

  const router = useRouter()
  const { account } = router.query

  const [ownedAccountInfo, setOwnedAccountInfo] = useState(null)
  const [user, setUser] = useState({ loggedIn: null })
  const [hybridCustody, setHybridCustody] = useState(null)

  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  const { data: itemsData, error: itemsError } = useSWR(
    account && isValidFlowAddress(account) ? ["ownedAccountInfoFetcher", account] : null, ownedAccountInfoFetcher
  )

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
      setOwnedAccountInfo(itemsData)
    }
  }, [itemsData])

  if (!account) {
    return <div className="h-screen"></div>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showItems = () => {
    if (!ownedAccountInfo) {
      return (
        <div className="flex w-full mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    }

    return (
      <>
        {ownedAccountInfo && ownedAccountInfo.parents.length > 0 ?
          ownedAccountInfo.parents.map((item, index) => {
            return (
              <ParentView key={`parents-${index}`} parent={item} account={account} user={user} />
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
            <div className="flex flex-col gap-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {`OwnedAccount`}
              </h1>
              {
                ownedAccountInfo && ownedAccountInfo.owner ?
                  <div className="text-sm">{`Owned by `}
                    <a
                      href={`${publicConfig.appURL}/account/${ownedAccountInfo.owner}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 text-sm font-medium cursor-pointer decoration-drizzle decoration-2 underline">
                      {`${ownedAccountInfo.owner}`}
                    </a>
                  </div>
                  : null}
            </div>

            <div className="hidden sm:flex gap-x-2 justify-end items-start">
              {
                ownedAccountInfo && !ownedAccountInfo.isOwnedAccountExists ?
                  <button
                    className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
                    disabled={transactionInProgress || !(user && user.loggedIn && user.addr == account)}
                    onClick={async () => {
                      setShowSetupDisplay({ show: true, mode: "OwnedAccount" })
                    }}
                  >
                    Setup Owned Acct
                  </button>
                  : null
              }
              {
                ownedAccountInfo && ownedAccountInfo.isOwnedAccountExists ?
                  <button
                    className={`text-black disabled:bg-yellow-200 disabled:text-gray-500 bg-yellow-400 hover:bg-yellow-600 px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
                    disabled={transactionInProgress || !(user && user.loggedIn && user.addr == account)}
                    onClick={async () => {
                      setShowPublishToParent(true)
                    }}
                  >
                    Publish To Parent
                  </button>
                  : null
              }
              {
                ownedAccountInfo && ownedAccountInfo.isOwnedAccountExists ?
                  <button
                    className={`text-white disabled:bg-red-400 bg-red-600 hover:bg-red-800 px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
                    disabled={transactionInProgress || !(user && user.loggedIn && user.addr == account)}
                    onClick={async () => {
                      setShowTransferOwnership({ show: true, mode: "Simple" })
                    }}
                  >
                    Transfer Ownership
                  </button>
                  : null
              }
                            {
                <button
                  className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark w-9 h-9 p-2 text-sm rounded-full font-semibold shrink-0`}
                  disabled={transactionInProgress}
                  onClick={async () => {
                    setShowConfigSetting({
                      show: true, callback: () => {
                        router.reload()
                      }
                    })
                  }}
                >
                  <CogIcon className="h-5 w-5 text-black" />
                </button>
              }
            </div>
          </div>
          <div className="px-2 py-2 overflow-x-auto h-screen w-full">
            <div className="inline-block min-w-full">
              {
                hybridCustody && hybridCustody != "" ?
              <div className="flex flex-col gap-y-4">
                {
                  ownedAccountInfo && ownedAccountInfo.display ?
                    <div className="flex flex-col max-w-[1094px] min-w-[1076px] gap-y-3 p-4 shadow-md rounded-2xl bg-white">
                      <OwnedDisplayView display={ownedAccountInfo.display} />
                    </div> : null
                }
                <h1 className="mt-4 text-lg sm:text-xl font-bold text-gray-900">
                  {`Parents ${ownedAccountInfo ? `(${ownedAccountInfo.parents.length})` : ""}`}
                </h1>
                <div className="flex flex-col gap-y-4">
                  {showItems()}
                </div>
              </div>
              : 
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
      <SetupDisplayModal />
      <PublishToParentModal />
      <TransferOwnershipModal />
    </div>
  )
}