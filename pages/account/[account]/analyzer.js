import { useRouter } from "next/router"
import Layout from "../../../components/common/Layout"
import { huntStorage, huntPrivate, huntPublic } from "../../../flow/bug_hunter"

export default function Analyzer() {
  const router = useRouter()
  const { account } = router.query

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div className="flex flex-col gap-x-2">
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

      </Layout>
    </div>
  )
}