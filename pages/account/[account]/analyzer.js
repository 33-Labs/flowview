import { useRouter } from "next/router"
import Layout from "../../../components/common/Layout"
import { hunt } from "../../../flow/bug_hunter"

export default function Analyzer() {
  const router = useRouter()
  const { account } = router.query

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <button
          onClick={async () => {
            await hunt(account)
          }}>
          Analyze
        </button>
      </Layout>
    </div>
  )
}