import { classNames } from "../../lib/utils"

const getHashTagColor = (hashAlgo) => {
  const colorMap = {
    "SHA2_256": { bg: "bg-green-100", text: "text-green-800" },
    "SHA3_256": { bg: "bg-blue-100", text: "text-blue-800" }
  }
  return colorMap[hashAlgo] || { bg: "bg-gray-100", text: "bg-gray-800" }
}

const getSignTagColor = (signAlgo) => {
  const colorMap = {
    "ECDSA_secp256k1": { bg: "bg-indigo-100", text: "text-indigo-800" },
    "ECDSA_P256": { bg: "bg-purple-100", text: "text-purple-800" }
  }
  return colorMap[signAlgo] || { bg: "bg-gray-100", text: "bg-gray-800" }
}

const dataField = (title, value) => {
  return (
    <div className="flex flex-col gap-y-1">
      <div className="px-2 text-sm text-gray-500 whitespace-nowrap">{title}</div>
      <div className="px-2 text-lg font-bold whitespace-nowrap">{value}</div>
    </div>
  )
}

export default function Key(props) {
  const { keyItem: key } = props

  const hashTag = getHashTagColor(key.hashAlgoString)
  const signTag = getSignTagColor(key.signAlgoString)

  return (
    <div className="flex flex-col gap-y-3 p-4 shadow-md rounded-2xl bg-white">
      <div className="flex gap-x-1 items-center">
        <label className="font-bold text-xl">{`#${key.index}`}&nbsp;&nbsp;</label>
        <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full ${hashTag.bg} ${hashTag.text}`}>{key.hashAlgoString}</label>
        <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full ${signTag.bg} ${signTag.text}`}>{key.signAlgoString}</label>
        {
          key.revoked ?
          <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full text-white bg-red-600`}>{"Revoked"}</label>
          : null
        }
      </div>
      <div className="w-full border-b-2"></div>
      <div className="mt-1">
        <textarea
          rows={4}
          name="publicKey"
          id="publicKey"
          className={classNames(
            key.revoked ? "bg-red-50 border-red-300" : "bg-drizzle-ultralight border-drizzle",
            "resize-none block w-full border-2 rounded-xl p-2 font-flow text-lg"
          )}
          disabled={true}
          value={key.publicKey}
          spellCheck={false}
        />
      </div>
      <div className="flex gap-x-3 justify-start">
        {dataField("Sequence Number", `${key.sequenceNumber}`)}
        {dataField("Weight", `${key.weight} / 1000`)}
      </div>
    </div>
  )
}