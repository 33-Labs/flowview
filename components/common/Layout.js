import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { getDefaultDomainsOfAddress } from "../../flow/scripts";
import { isValidFlowAddress } from "../../lib/utils";
import publicConfig from "../../publicConfig";
import AlertModal from "./AlertModal";
import SearchBar from "./SearchBar";
import Sidebar from "./Siderbar";
import { useRecoilState } from "recoil"
import {
  showBasicNotificationState,
  basicNotificationContentState,
  currentDefaultDomainsState
} from "../../lib/atoms"
import { DocumentDuplicateIcon } from "@heroicons/react/outline"

export default function Layout({ children }) {
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)

  const router = useRouter()
  const { account } = router.query

  const [currentDefaultDomains, setCurrentDefaultDomains] = useRecoilState(currentDefaultDomainsState)

  useEffect(() => {
    if (account && isValidFlowAddress(account)) {
      if (!currentDefaultDomains || (currentDefaultDomains.address != account)) {
        setCurrentDefaultDomains(null)

        getDefaultDomainsOfAddress(account).then((domainsMap) => {
          const domains = []
          for (const [service, domain] of Object.entries(domainsMap)) {
            const comps = domain.split(".")
            const name = comps[0]
            const url = service == "flowns" ?
              `${publicConfig.flownsURL}/${domain}` : `${publicConfig.findURL}/${name}`
            domains.push({
              service: service,
              domain: domain,
              url: url
            })
          }
          setCurrentDefaultDomains({
            address: account,
            domains: domains
          })
        }).catch((e) => console.error(e))
      }
    }
  }, [currentDefaultDomains, account])

  return (
    <>
      <div className="flex flex-col gap-y-2">
        <div className="px-5 mb-10">
          <SearchBar />
        </div>
        <div className="px-5 flex flex-col gap-y-1">
          <label className="text-lg sm:text-xl text-gray-500">Account</label>
          <div className="flex gap-x-1 items-center">
            <label className="text-2xl sm:text-3xl font-bold">{`${account}`}</label>
            <DocumentDuplicateIcon className="text-gray-700 hover:text-drizzle w-6 h-6"
              onClick={async () => {
                await navigator.clipboard.writeText(account)
                setShowBasicNotification(true)
                setBasicNotificationContent({ type: "information", title: "Copied!", detail: null })
              }} />
          </div>
        </div>
        {currentDefaultDomains && currentDefaultDomains.domains.length > 0 ?
          <div className="mt-4 px-5 flex flex-col gap-y-1">
            <label className="text-base sm:text-lg text-gray-500">Default Domains</label>
            <div className="mt-1 flex gap-x-2">{
              currentDefaultDomains.domains.map((domain, index) => {
                return (
                  <label key={`${domain.domain}_${index}`} className={`cursor-pointer font-bold text-sm px-3 py-2 leading-5 rounded-full text-emerald-800 bg-emerald-100`}>
                    <a href={domain.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {domain.domain}
                    </a>
                  </label>
                )
              })}
            </div>
          </div>
          : null
        }
        <div className="mt-10 flex flex-row gap-x-2 sm:gap-x-4 justify-start">
          <Sidebar />
          <div className="px-2 py-2 overflow-x-auto w-full h-screen">
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