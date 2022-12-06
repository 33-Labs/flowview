import { useRouter } from "next/router"
import { useState } from "react"
import Layout from "../../../components/common/Layout"
import { huntStorage, huntPrivate, huntPublic } from "../../../flow/bug_hunter"
import { getAccountInfo } from "../../../flow/scripts"
import { isValidFlowAddress } from "../../../lib/utils"

export default function Analyzer() {
  const router = useRouter()
  const { account } = router.query

  const [rawRecordsStr, setRawRecordsStr] = useState("")

  const checkAccounts = async (rawAccounts) => {
    const accounts = rawAccounts.split("\n").map((a) => a.trim()).filter((a) => a.trim() != "")
    console.log(accounts)
    const checkedAccounts = []
    for (let i = 0; i < accounts.length; i++) {
      console.log(`processing ${i + 1} of ${accounts.length}...`)
      let account = accounts[i]
      if (!isValidFlowAddress(account) &&
      !isValidFlowAddress(`0x${account}`) &&
      !isValidFlowAddress(`0x0${account}`) &&
      !isValidFlowAddress(account.replace("0x", "0x0"))) {
        checkedAccounts.push({account: account, isExist: false})
        continue
      }

      try {
        const result = await getAccountInfo(account)
        checkedAccounts.push({account: account, isExist: true})
      } catch (e) {
        // console.error(e)
        checkedAccounts.push({account: account, isExist: false})
      }
    }

    return checkedAccounts
  }

  const generateCsvForCheckedAccounts = (checkedAccounts) => {
    console.log(checkedAccounts)
    let data = "Wallets to check,Exists?\n"
    for (let i = 0; i < checkedAccounts.length; i++) {
      const info = checkedAccounts[i]
      data = data.concat(`${info.account},${info.isExist ? "true" : "false"}\n`)
    }
    console.log(data)
    const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(data)}`
    window.open(csvContent)
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div className="flex w-full flex-col gap-y-2">
          <div>
            <label className="block text-2xl font-bold font-flow">
              Addresses
            </label>
            <div className="mt-1">
              <textarea
                rows={8}
                name="recipients"
                id="recipients"
                className="px-3 py-2 focus:border-drizzle-dark border-2 rounded-2xl outline-none
        bg-drizzle-ultralight resize-none block w-full border-drizzle font-flow text-lg placeholder:text-gray-300"
                spellCheck={false}
                value={rawRecordsStr}
                placeholder={
                  "0xf8d6e0586b0a20c7"
                }
                onChange={(event) => {
                  setRawRecordsStr(event.target.value)
                }}
              />
              <div className="flex mt-4 gap-x-2 justify-between">
                <button
                  type="button"
                  className={"bg-drizzle hover:bg-drizzle-dark h-12 w-40 px-6 text-base rounded-2xl font-medium shadow-md text-black"}
                  onClick={async () => {
                    const checkedAccounts = await checkAccounts(rawRecordsStr)
                    const csv = generateCsvForCheckedAccounts(checkedAccounts)
                    console.log(csv)
                  }}
                >
                  Process
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-y-2">
            <button
              onClick={async () => {
                await huntStorage(account)
              }}>
              Analyze Storage
            </button>
            <button
              onClick={async () => {
                await huntPublic(account)
              }}>
              Analyze Public
            </button>
            <button
              onClick={async () => {
                await huntPrivate(account)
              }}>
              Analyze Private
            </button>
          </div>
        </div>

      </Layout>
    </div>
  )
}