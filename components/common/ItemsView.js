import { ArrowRightIcon } from "@heroicons/react/outline"
import { useRouter } from "next/router"

const getPathType = (path) => {
  if (path.includes("/public")) {
    return "Public"
  }

  if (path.includes("/storage")) {
    return "Storage"
  }

  if (path.includes("/private")) {
    return "Private"
  }
}

const formatPath = (path, classes) => {
  const comps = path.split("/")
  const domain = comps[1]
  const itemPath = comps[2]
  return (
    <label className={`${classes} max-w-[830px] truncate text-ellipsis overflow-hidden shrink`}>
      {`/${domain}/`}<span className="font-bold">{`${itemPath}`}</span>
    </label>
  )
}

export default function ItemsView(props) {
  const router = useRouter()
  const { item, account } = props
  const pathType = getPathType(item.path)

  // Only show badge for storage items
  let tag = null
  if (pathType == "Storage") {
    if (item.isNFTCollection) {
      tag = { title: "NFT", bg: "bg-yellow-100", text: "text-yellow-800" }
    } else if (item.isVault) {
      tag = { title: "Vault", bg: "bg-blue-100", text: "text-blue-800" }
    }
  }

  const getTargetView = (pathType) => {
    return (
      pathType != "Storage" ?
        <div className="flex gap-x-1">
          <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full text-purple-800 bg-purple-100`}>
            Target
          </label>
          <label>{item.targetPath ? formatPath(item.targetPath, "text-base text-gray-600") : "Unknown"}</label>
        </div> : null
    )
  }

  return (
    <div className="min-w-[1076px] flex flex-col gap-y-3 p-4 shadow-md rounded-2xl bg-white"
      onClick={() => {
        if (pathType == "Public") {
          router.push({
            pathname: `${router.pathname}/[public_item]`,
            query: { account: account, public_item: item.path.replace("/public/", "") }
          }, undefined, {shallow: true, scroll: false})
        } else if (pathType == "Private") {
          router.push({
            pathname: `${router.pathname}/[private_item]`,
            query: { account: account, private_item: item.path.replace("/private/", "") }
          }, undefined, {shallow: true, scroll: false})
        } else {
          router.push({
            pathname: `${router.pathname}/[stored_item]`,
            query: { account: account, stored_item: item.path.replace("/storage/", "") }
          }, undefined, {shallow: true, scroll: false})
        }
      }}
    >
      <div className="flex gap-x-2 justify-between items-center">
        {
          tag ? <div className="flex gap-x-1 items-center shrink truncate">
            {formatPath(item.path, "text-base")}
            <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full ${tag.bg} ${tag.text}`}>{tag.title}</label>
          </div>
            :
            <div className="flex flex-col gap-y-1">
              {formatPath(item.path, "text-base")}
              <div className="px-4">
                {getTargetView(pathType)}
              </div>
            </div>
        }

        <button
          type="button"
          className={"text-drizzle disabled:text-drizzle-light shrink-0"}
        >
          <ArrowRightIcon className=" w-[24px] aspect-square shrink-0" />
        </button>
      </div>
    </div>
  )
}