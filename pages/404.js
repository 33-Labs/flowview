import { useRouter } from "next/router"

export default function Custom404(props) {
  const router = useRouter()
  const { account } = router.query
  const title = props.title || "Page not found"
  const detail = props.detail || "Please check the URL in the address bar and try again."
  const storagePath = props.storagePath
  return (
    <>
      <div className="min-h-[40vh] px-8 py-16 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="max-w-max mx-auto">
          <main className="sm:flex">
            <p className="text-3xl font-bold text-red-400 sm:text-4xl">404</p>
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">{title}</h1>
                {
                  title == "Get metadata failed" && storagePath ?
                    <p className="cursor-pointer mt-1 text-base text-gray-500" onClick={() => {
                      router.push(`/account/${account}/storage/${storagePath}`)
                    }}>{`You can click here to see the storage item`}</p>
                    : <p className="mt-1 text-base text-gray-500">{detail}</p>
                }
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}