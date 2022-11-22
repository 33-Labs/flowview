import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { getDefaultDomainsOfAddress } from "../../flow/scripts";
import { isValidFlowAddress } from "../../lib/utils";
import AlertModal from "./AlertModal";
import SearchBar from "./SearchBar";
import Sidebar from "./Siderbar";

const defaultDomainsFetcher = async (funcName, address) => {
  return await getDefaultDomainsOfAddress(address)
}

export default function Layout({ children }) {
  const router = useRouter()
  const { account } = router.query

  const [defaultDomains, setDefaultDomains] = useState(null)

  const { data: domainsData, error: domainsError } = useSWR(
    account && isValidFlowAddress(account) ? ["defaultDomainsFetcher", account] : null, defaultDomainsFetcher
  )

  useEffect(() => {
    if (domainsData) {
      console.log(domainsData)
      setDefaultDomains(domainsData)
    }
  }, [domainsData])

  return (
    <>
      <div className="flex flex-col gap-y-2">
        <div className="px-5 mb-10">
          <SearchBar />
        </div>
        <div className="px-5 flex flex-col gap-y-1">
          <label className="text-lg sm:text-xl text-gray-500">Account</label>
          <label className="text-2xl sm:text-3xl font-bold">{`${account}`}</label>
        </div>
        {defaultDomains ?
          <div className="mt-2 px-4 flex gap-x-2">{
            Object.values(defaultDomains).map((domain, index) => {
              return (
                <label key={`${domain}_${index}`} className={`font-bold text-sm px-3 py-2 leading-5 rounded-full text-emerald-800 bg-emerald-100`}>{domain}</label>
              )
            })}
          </div>
          : null
        }
        <div className="mt-10 flex flex-row gap-x-2 sm:gap-x-4 justify-start">
          <Sidebar />
          <div className="px-2 py-2 overflow-x-auto w-full">
            <div className="inline-block min-w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
      <AlertModal />
    </>
  )
}