import { useRouter } from "next/router";
import Layout from "../../components/common/Layout";
import { isValidFlowAddress } from "../../lib/utils";
import Custom404 from "./404";

export default function Account() {
  const router = useRouter()
  const { account } = router.query

  if (!account) {
    return <></>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
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
      <Layout>{account}</Layout>
    </div>
  )
}