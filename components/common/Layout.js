import { useRouter } from "next/router";
import SearchBar from "./SearchBar";
import Sidebar from "./Siderbar";

export default function Layout({ children }) {
  const router = useRouter()
  const { account } = router.query

  return (
    <div className="flex flex-col gap-y-2">
      <div className="px-5 mb-10">
        <SearchBar />
      </div>
      <div className="px-5 flex flex-col gap-y-1">
        <label className="text-lg sm:text-xl text-gray-500">Account</label>
        <label className="text-2xl sm:text-3xl font-bold">{`${account}`}</label>
      </div>
      <div className="mt-10 flex flex-row gap-x-2 sm:gap-x-4 justify-start">
        <Sidebar />
        <div className="px-2 py-2 overflow-x-auto w-full">
          <div className="inline-block min-w-full">
            {children}
          </div>
        </div>
      </div>
    </div>

  )
}