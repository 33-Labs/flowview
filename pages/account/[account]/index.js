import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Layout from "../../../components/common/Layout";
import Spinner from "../../../components/common/Spinner";
import { getAccountInfo } from "../../../flow/scripts";
import { isValidFlowAddress, percentage } from "../../../lib/utils";
import Custom404 from "./404";

const basicInfoFetcher = async (funcName, address) => {
  return await getAccountInfo(address)
}

export default function Account(props) {
  const router = useRouter()
  const { account } = router.query

  const [basicInfo, setBasicInfo] = useState(null)
  const { data: infoData, error: infoError } = useSWR(
    account && isValidFlowAddress(account) ? ["basicInfoFetcher", account] : null, basicInfoFetcher
  )

  useEffect(() => {
    if (infoData) {
      setBasicInfo(infoData)
    }
  }, [infoData])

  if (!account) {
    return <></>
  }

  if (!isValidFlowAddress(account) || infoError) {
    return <Custom404 title={"Account may not exist"} />
  }

  const dataField = (title, value) => {
    return (
      <div className="flex flex-col gap-y-1">
        <div className="px-2 text-base text-gray-500 whitespace-nowrap">{title}</div>
        <div className="px-2 text-xl font-bold whitespace-nowrap">{value}</div>
      </div>
    )
  }

  const showInfo = () => {
    if (!infoData || !basicInfo) {
      return (
        <div className="flex mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    } else {
      return (
        <div className="flex flex-col gap-y-4 p-5 shadow-md rounded-2xl bg-white">
          {dataField("Balance", `${basicInfo.balance} FLOW`)}
          {dataField("Available Balance", `${basicInfo.availableBalance} FLOW`)}
          {dataField("Storage Used", `${basicInfo.storageUsed} Bytes / ${percentage(basicInfo.storageUsed, basicInfo.storageCapacity)}`)}
          {dataField("Storage Capacity", `${basicInfo.storageCapacity} Bytes`)}
        </div>
      )
    }
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <div hidden className="text-green-800  bg-green-100"></div>
      <div hidden className="text-blue-800 bg-blue-100"></div>
      <div hidden className="text-rose-800 bg-rose-100"></div>
      <div hidden className="text-yellow-800 bg-yellow-100"></div>
      <div hidden className="text-teal-800 bg-teal-100"></div>
      <div hidden className="text-indigo-800 bg-indigo-100"></div>
      <div hidden className="text-slate-800 bg-slate-100"></div>
      <div hidden className="text-purple-800 bg-purple-100"></div>
      <Layout>
        {showInfo()}
      </Layout>
    </div>
  )
}