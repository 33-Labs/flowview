import publicConfig from "../../publicConfig"

const getTypeColor = (typeKind) => {
  console.log("Kind", typeKind)
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
  return colorMap[typeKind] || {bg: "bg-gray-100", text: "bg-gray-800"}
}

const formatPath = (path) => {
  const comps = path.split("/")
  const domain = comps[1]
  const itemPath = comps[2]
  return (
    <label className="text-base">
      {`/${domain}/`}<span className="font-bold">{`${itemPath}`}</span>
    </label>
  )
}

const formatTypeID = (typeID) => {
  // e.g. A.631e88ae7f1d7c20.NonFungibleToken .CollectionPublic
  const comps = typeID.split(".")
  const contract = [comps[0], comps[1], comps[2]].join(".")
  const url = `${publicConfig.flowscanURL}/contract/${contract}`
  const rest = typeID.replace(contract, "")
  return (
    <label>
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-bold decoration-emerald decoration-2">
        {contract}
      </a>{`${rest}`}
    </label>
  )
}

const doGetTypeView = (type) => {
  const kindColor = getTypeColor(type.kind)
  if (type.kind == "Restriction") {
    return (
      <div className="flex flex-col gap-y-1 items-start">
        {type.restrictions.map((r) => {
          const restrictionColor = getTypeColor(r.kind)
          return (
            <div className="flex flex-row gap-x-1 pl-4">
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
  const { item } = props
  console.log(item)
  return (
    <div className="flex flex-col gap-y-3 p-4 shadow-md rounded-2xl bg-white">
      {formatPath(item.path)}
      <div className="w-full border-b-2"></div>
      <div className="mt-1">
        {getTypeView(item.type, 0)}
      </div>
    </div>
  )
}