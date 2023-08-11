import * as fcl from "@onflow/fcl"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import ItemsView from "../../../../components/common/ItemsView"
import Layout from "../../../../components/common/Layout"
import Spinner from "../../../../components/common/Spinner"
import { isValidFlowAddress } from "../../../../lib/utils"
import Custom404 from "../404"
import { getParentAddresses } from "../../../../flow/hc_scripts"
import { useRecoilState } from "recoil"
import { showSetupOwnedAccountState, transactionInProgressState, transactionStatusState } from "../../../../lib/atoms"
import SetupOwnedAccountModal from "../../../../components/hybrid_custody/SetupOwnedAccountModal"

const parentsFetcher = async (funcName, address) => {
  return getParentAddresses(address)
}

export default function Parents(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [showSetupOwnedAccount, setShowSetupOwnedAccount] = useRecoilState(showSetupOwnedAccountState)

  const router = useRouter()
  const { account } = router.query

  const [ownedAccountInfo, setOwnedAccountInfo] = useState(null)
  const [user, setUser] = useState({ loggedIn: null })

  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  const { data: itemsData, error: itemsError } = useSWR(
    account && isValidFlowAddress(account) ? ["parentsFetcher", account] : null, parentsFetcher
  )

  useEffect(() => {
    console.log(itemsData)
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
        {ownedAccountInfo && ownedAccountInfo.parentAddresses.length > 0 ?
          ownedAccountInfo.parentAddresses.map((item, index) => {
            return (
              <ItemsView key={`parents-${index}`} item={item} account={account} user={user} />
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
              {`Parents ${ownedAccountInfo ? `(${ownedAccountInfo.parentAddresses.length})` : ""}`}
            </h1>
            <div className="flex gap-x-2 justify-end">
            {
                user && user.loggedIn && user.addr == account && ownedAccountInfo && !ownedAccountInfo.isOwnedAccountExists ?
                <button
                  className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
                  disabled={transactionInProgress}
                  onClick={async () => {
                    console.log("SetupOwnedAccount")
                    setShowSetupOwnedAccount(true)
                    // TODO: Modal a form
                    // await setupSwitchboard(setTransactionInProgress, setTransactionStatus)
                    // mutate(["switchboardFetcher", account])
                  }}
                >
                  Setup Owned Acct
                </button>
                : null
            }
            {
                user && user.loggedIn && user.addr == account && ownedAccountInfo && ownedAccountInfo.isOwnedAccountExists ?
                <button
                  className={`text-black disabled:bg-drizzle-light disabled:text-gray-500 bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}
                  disabled={transactionInProgress}
                  onClick={async () => {
                    console.log("SetupOwnedAccount")
                    // TODO: Modal a form
                    // await setupSwitchboard(setTransactionInProgress, setTransactionStatus)
                    // mutate(["switchboardFetcher", account])
                  }}
                >
                  Publish Ownership
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
      <SetupOwnedAccountModal />
    </div>
  )
}