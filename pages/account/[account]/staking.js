import Decimal from "decimal.js"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import Layout from "../../../components/common/Layout"
import Spinner from "../../../components/common/Spinner"
import { getStakingInfo } from "../../../flow/staking_scripts"
import { isValidFlowAddress } from "../../../lib/utils"
import publicConfig from "../../../publicConfig"
import Custom404 from "./404"

const stakingInfoFetcher = async (funcName, address) => {
  return await getStakingInfo(address)
}

const getNodeRole = (rawRole) => {
  const map = {
    "0": "NONE",
    "1": "COLLECTOR",
    "2": "CONSENSUS",
    "3": "EXECUTION",
    "4": "VERIFICATION",
    "5": "ACCESS"
  }
  return map[rawRole] ?? "UNKNOWN"
}

const getEpochPhrase = (rawPhrase) => {
  const map = {
    "0": "STAKINGAUCTION",
    "1": "EPOCHSETUP",
    "2": "EPOCHCOMMIT"
  }
  return map[rawPhrase] ?? "UNKNOWN"
}

export default function Staking(props) {
  const router = useRouter()
  const { account } = router.query

  const [stakingInfo, setStakingInfo] = useState(null)
  const { data: infoData, error: infoError } = useSWR(
    account && isValidFlowAddress(account) ? ["stakingInfoFetcher", account] : null, stakingInfoFetcher
  )

  useEffect(() => {
    if (infoError) {
      setStakingInfo(null)
      return
    }

    if (infoData && infoData.stakingInfo) {
      setStakingInfo(infoData.stakingInfo)
    }
  }, [infoData, infoError])

  if (!account) {
    return <div className="h-screen"></div>
  }

  console.log(infoError)
  if (!isValidFlowAddress(account) || infoError) {
    return <Custom404 title={"Account may not exist"} />
  }

  const dataField = (title, value, addressLinkToValue) => {
    return (
      <div className="p-1 flex flex-col gap-y-1 min-w-[360px]">
        <div className="px-2 text-base text-gray-500 whitespace-nowrap">{title}</div>
        {
          addressLinkToValue ?
            <div className="cursor-pointer px-2 text-xl font-bold whitespace-nowrap decoration-drizzle decoration-2 underline"
              onClick={() => {
                router.push(`/account/${value}`)
              }}>{value}</div>
            :
            <div className="px-2 text-xl font-bold whitespace-nowrap">{value}</div>
        }
      </div>
    )
  }

  const showInfo = () => {
    if (infoData && !infoData.stakingInfo) {
      return (
        <div className="flex mt-10 h-[70px] text-gray-400 text-base justify-center">
          No Staking Info
        </div>
      )
    } else if (!infoData || !stakingInfo) {
      return (
        <div className="flex w-full mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    } else {
      return (
        <div className="p-2 flex flex-col gap-y-8">
          <div className="flex flex-col gap-y-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {`Locked Account`}
            </h1>
            <div className="w-full min-w-[1076px] grid grid-cols-3 gap-x-4 gap-y-4 p-5 shadow-md rounded-2xl bg-white">
              {dataField("Locked Account Address", `${stakingInfo.lockedAddress}`, true)}
              {dataField("Locked Account Balance", `${new Decimal(stakingInfo.lockedBalance).toString()} FLOW`)}
              {dataField("Unlock Limit", `${new Decimal(stakingInfo.unlockLimit)} FLOW`)}
            </div>
          </div>

          <div className="flex flex-col gap-y-3">
            <div className="flex flex-row justify-between gap-x-3 min-w-[1076px]">
              <div className="flex gap-x-2 items-center">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {`Staking Info`}
                </h1>
                <label className={`font-bold text-sm px-2 py-1 leading-5 rounded-full bg-emerald-100 text-emerald-800`}>{`Epoch: ${stakingInfo.epochInfo.currentEpochCounter}`}</label>
                <label className={`font-bold text-sm px-2 py-1 leading-5 rounded-full bg-blue-100 text-blue-800`}>{`Epoch Phrase: ${getEpochPhrase(stakingInfo.epochInfo.currentEpochPhase)}`}</label>
              </div>

              <label className={`cursor-pointer text-white bg-increment hover:bg-blue-800 px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}>
                <a href={`${publicConfig.incrementURL}/staking`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Staking at Increment
                </a>
              </label>

            </div>
            <div className="w-full min-w-[1076px] p-5 shadow-md rounded-2xl bg-white">
              <div className="w-full grid grid-cols-3 gap-x-4 gap-y-4 ">
                {dataField("Staked", `${new Decimal(stakingInfo.delegatorInfo.tokensStaked).toString()} FLOW`)}
                {dataField("Rewarded", `${new Decimal(stakingInfo.delegatorInfo.tokensRewarded).toString()} FLOW`)}
                {dataField("Committed", `${new Decimal(stakingInfo.delegatorInfo.tokensCommitted).toString()} FLOW`)}
                {dataField("Requested To Unstake", `${new Decimal(stakingInfo.delegatorInfo.tokensRequestedToUnstake).toString()} FLOW`)}
                {dataField("Unstaking", `${new Decimal(stakingInfo.delegatorInfo.tokensUnstaking).toString()} FLOW`)}
                {dataField("Unstaked", `${new Decimal(stakingInfo.delegatorInfo.tokensUnstaked).toString()} FLOW`)}
              </div>
              <div className="mt-6 px-2 py-5 flex flex-col gap-y-2 rounded-2xl border-dashed border-drizzle border-4">
                <h1 className="px-3 text-lg sm:text-xl font-bold text-gray-900">
                  {`Node Info`}
                </h1>
                <div className="px-3">
                  <div className="font-normal text-gray-700">{`ID: `}<span className="font-bold text-gray-900">{`${stakingInfo.nodeInfo.id}`}</span></div>
                  <div className="font-normal text-gray-700">{`Networking Address: `}<span className="font-bold text-gray-900">{`${stakingInfo.nodeInfo.networkingAddress}`}</span></div>
                </div>
                <div className="p-3">
                  <div className="border-t border-solid box-border w-full"></div>
                </div>
                <div className="w-full grid grid-cols-3 gap-x-4 gap-y-4">
                  {dataField("Delegator Count", `${stakingInfo.nodeInfo.delegatorIDCounter}`)}
                  {dataField("Role", `${getNodeRole(stakingInfo.nodeInfo.role)}`)}
                  {dataField("Initial Weight", `${stakingInfo.nodeInfo.initialWeight}`)}

                  {dataField("Staked", `${new Decimal(stakingInfo.nodeInfo.tokensStaked).toString()} FLOW`)}
                  {dataField("Rewarded", `${new Decimal(stakingInfo.nodeInfo.tokensRewarded).toString()} FLOW`)}
                  {dataField("Committed", `${new Decimal(stakingInfo.nodeInfo.tokensCommitted).toString()} FLOW`)}
                  {dataField("Requested To Unstake", `${new Decimal(stakingInfo.nodeInfo.tokensRequestedToUnstake).toString()} FLOW`)}
                  {dataField("Unstaking", `${new Decimal(stakingInfo.nodeInfo.tokensUnstaking).toString()} FLOW`)}
                  {dataField("Unstaked", `${new Decimal(stakingInfo.nodeInfo.tokensUnstaked).toString()} FLOW`)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div className="flex w-full h-screen flex-col gap-y-3 overflow-auto">
          {showInfo()}
        </div>
      </Layout>
    </div>
  )
}