import Sidebar from "./Siderbar";

export default function Layout({ children }) {
  return (
    <div className="flex flex-row gap-x-4 justify-start">
      <Sidebar />
      <div className="px-2 py-2 overflow-x-auto w-full">
        <div className="inline-block min-w-full">
          {children}
        </div>
      </div>
    </div>
  )
}