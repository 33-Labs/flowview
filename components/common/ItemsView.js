import publicConfig from "../../publicConfig"
import { useRecoilState } from "recoil"
import {
  transactionStatusState,
  transactionInProgressState,
  showAlertModalState,
  alertModalContentState
} from "../../lib/atoms"
import { classNames, getContract, getContractLink } from "../../lib/utils"
import { destroy, unlink } from "../../flow/transactions"
import { useSWRConfig } from 'swr'
import { useState } from "react"
import { getStoredResource, getStoredStruct } from "../../flow/scripts"
import SyntaxHighlighter from 'react-syntax-highlighter'
import Spinner from "../../components/common/Spinner"
import { vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/hljs'

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

const getTypeColor = (typeKind) => {
  const colorMap = {
    "Restriction": {
      bg: "bg-rose-100",
      text: "text-rose-800"
    },
    "Resource": {
      bg: "bg-green-100",
      text: "text-green-800"
    },
    "ResourceInterface": {
      bg: "bg-yellow-100",
      text: "text-yellow-800"
    },
    "Reference": {
      bg: "bg-indigo-100",
      text: "text-indigo-800"
    },
    "Capability": {
      bg: "bg-teal-100",
      text: "text-teal-800"
    },
    "AnyResource": {
      bg: "bg-slate-100",
      text: "text-slate-800"
    }
  }
  return colorMap[typeKind] || { bg: "bg-gray-100", text: "text-gray-800" }
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

const formatTypeID = (typeID) => {
  // e.g. A.631e88ae7f1d7c20.NonFungibleToken .CollectionPublic
  const contract = getContract(typeID)
  const url = getContractLink(contract)
  const rest = typeID.replace(contract, "")
  return (
    <label>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-bold decoration-drizzle decoration-2">
        {contract}
      </a>{`${rest}`}
    </label>
  )
}

const doGetTypeView = (type) => {
  if (type.kind == "Restriction") {
    return (
      <div className="flex flex-col gap-y-1 items-start">
        {type.restrictions.map((r, index) => {
          const restrictionColor = getTypeColor(r.kind)
          return (
            <div key={`${r.typeID}-${index}`} className="flex flex-row gap-x-1 pl-4">
              <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full ${restrictionColor.bg} ${restrictionColor.text}`}>
                {r.kind}
              </label>
              <div className="text-sm flex flex-col leading-6">
                {formatTypeID(r.typeID)}
              </div>
            </div>
          )
        })
        }
      </div>
    )
  }

  return (
    <label className="pl-4 text-sm leading-6">{formatTypeID(type.typeID)}</label>
  )
}

const getTypeView = (type, deep) => {
  const kindColor = getTypeColor(type.kind)
  return (
    <div className="flex flex-col gap-y-1 items-start">
      <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full ${kindColor.bg} ${kindColor.text}`}>
        {type.kind}
      </label>
      {type.typeID ? doGetTypeView(type) : null}
      {type.type ?
        <div className={`pl-4`}>
          {getTypeView(type.type, deep + 4)}
        </div> : null
      }
    </div>
  )
}

export default function ItemsView(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [, setShowAlertModal] = useRecoilState(showAlertModalState)
  const [, setAlertModalContent] = useRecoilState(alertModalContentState)

  const { item, account, user } = props
  const [showResource, setShowResource] = useState(false)
  const [resource, setResource] = useState(null)
  const [resourceError, setResourceError] = useState(null)

  const { mutate } = useSWRConfig()
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

  const getUnlinkButton = () => {
    return (
      <button
        type="button"
        disabled={transactionInProgress}
        className={
          classNames(
            transactionInProgress ? "bg-drizzle-light text-gray-500" : "text-black bg-drizzle hover:bg-drizzle-dark",
            `px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`
          )
        }
        onClick={async () => {
          await unlink(item.path, setTransactionInProgress, setTransactionStatus)
          if (pathType == "Public") {
            mutate(["publicItemsFetcher", item.address])
          } else if (pathType == "Private") {
            mutate(["privateItemsFetcher", item.address])
          }
        }}
      >
        UNLINK
      </button>
    )
  }

  const getLoadResourceButton = (isResource) => {
    return (
      <button
        type="button"
        disabled={transactionInProgress}
        className={
          classNames(
            transactionInProgress ? "bg-drizzle-light text-gray-500" : "text-black bg-drizzle hover:bg-drizzle-dark",
            `px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`
          )
        }
        onClick={async () => {
          if (showResource) {
            setShowResource(false)
            return
          }

          if (!showResource || resourceError) {
            setShowResource(true)
            setResourceError(null)

            if (isResource) {
              getStoredResource(account, item.path, setTransactionInProgress, setTransactionStatus)
              .then((resource) => {
                  setResource(resource)
              })
              .catch((e) => {
                setResourceError(e)
              })
            } else {
              getStoredStruct(account, item.path, setTransactionInProgress, setTransactionStatus)
              .then((resource) => {
                if (typeof resource == "boolean") {
                  setResource(`${resource}`)
                } else {
                  setResource(resource)
                }
              })
              .catch((e) => {
                console.log(e)
                setResourceError(e)
              })
            }
          }
        }}
      >
        {showResource ? "HIDE DETAIL" : "SHOW DETAIL"}
      </button>
    )
  }

  const getDestroyButton = () => {
    return (
      <button
        type="button"
        disabled={transactionInProgress}
        className={
          classNames(
            transactionInProgress ? "bg-red-400 text-white" : "text-white bg-red-600 hover:bg-red-800",
            `px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`
          )
        }
        onClick={async () => {
          setShowAlertModal(false)
          setAlertModalContent({
            title: "Dangerous Action",
            content: "Destroy resource is NOT unrevertible, please make sure you know what you are doing",
            actionTitle: "DESTROY",
            action: async () => {
              await destroy(item.path, setTransactionInProgress, setTransactionStatus)
              mutate(["storedItemsFetcher", item.address])
            }
          })
          setShowAlertModal(true)
        }}
      >
        DESTROY
      </button>
    )
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
    <div className="min-w-[1076px] flex flex-col gap-y-3 p-4 shadow-md rounded-2xl bg-white">
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
        {
          user && user.loggedIn && user.addr == account ?
            (pathType == "Storage" ? <div className="flex gap-x-2 items-center">
              {getLoadResourceButton(item.isResource)}
              {item.isResource ? getDestroyButton() : null}
            </div> : getUnlinkButton()) : (
              pathType == "Storage" && getLoadResourceButton(item.isResource)
            )
        }
      </div>

      <div className="w-full border-b-2"></div>
      <div className="mt-1">
        {getTypeView(item.type, 0)}
      </div>

      {
        showResource ?
          (resource ?
            <div className="mt-1 flex flex-col items-center">
              <SyntaxHighlighter className="rounded-lg text-xs w-[1044px] overflow-auto max-h-[500px]" language="json" style={vs2015}>
                {JSON.stringify(resource, null, 2)}
              </SyntaxHighlighter>
            </div> :
            (
              resourceError ? <div className="flex mt-1 h-[100px] text-gray-400 text-base justify-center items-center">
                Load resource failed
              </div> :
                <div className="flex mt-1 h-[100px] justify-center">
                  <Spinner />
                </div>)
          )
          : null
      }
    </div>
  )
}