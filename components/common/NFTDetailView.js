import Decimal from "decimal.js"
import Image from "next/image"
import { useRouter } from "next/router"
import { getImageSrcFromMetadataViewsFile, getRarityColor } from "../../lib/utils"

export default function NFTDetailView(props) {
  const router = useRouter()
  const { metadata } = props
  // const rarityColor = getRarityColor(display.rarity ? display.rarity.toLowerCase() : null)
  console.log("metadata", metadata)

  const getEditionsView = (metadata) => {
    const editions = metadata.editions
    if (!editions || editions.infoList.length == 0) { return null }
    return (
      <div className="flex flex-col gap-y-4 p-4"> 
        <h1 className="shrink-0 text-xl sm:text-2xl font-bold text-gray-900">
          {`Editions (${editions.infoList.length})`}
        </h1>
        <div className="flex flex-col gap-y-2">
          {
            editions.infoList.map((edition) => {
              return (
                <div className="flex gap-x-1">
                 <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full bg-blue-100 text-blue-800`}>{`${edition.name} `}<span className="text-blue-300">&nbsp;|&nbsp;</span>{` #${edition.number} / ${edition.max}`}</label> 
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }

  const getRoyaltiesView = (metadata) => {
    const royalties = metadata.royalties
    if (!royalties || royalties.cutInfos.length == 0) { return null } 
    return (
      <div className="flex flex-col gap-y-4 p-4"> 
        <h1 className="shrink-0 text-xl sm:text-2xl font-bold text-gray-900">
          {`Royalties (${royalties.cutInfos.length})`}
        </h1>
        <div className="flex flex-col w-full shrink-0">
          <div className="px-1 overflow-x-auto">
            <div className="inline-block min-w-full py-2 align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Cut
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Receiver
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {royalties.cutInfos.map((cut, index) => (
                      <tr key={`royalties-${index}`}>
                        <td className="py-4 px-3 text-sm font-bold">
                          {`${new Decimal(cut.cut).mul(100).toString()}%`}
                        </td>
                        <td className="px-3 py-4 text-sm text-black min-w-[140px]">
                          <button
                          onClick={() => {
                            router.push(`/account/${cut.receiver.address}`)
                          }}>
                            <label 
                              className="cursor-pointer underline font-bold decoration-drizzle decoration-2"
                            >
                              {cut.receiver.address}
                            </label>
                          </button>
                        </td>
                        <td className="px-3 py-4 text-sm text-black min-w-[140px]">
                          {cut.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getTraitsView = (metadata) => {
    const traits = metadata.traits && metadata.traits.traits
    if (!traits || traits.length == 0) return null
    return (
      <div className="flex flex-col gap-y-4 p-4">
        <h1 className="shrink-0 text-xl sm:text-2xl font-bold text-gray-900">
          {`Traits (${traits.length})`}
        </h1>
        <div className="flex flex-wrap gap-x-2 gap-y-2">
          {
            traits.sort((a, b) => { return a.value.length - b.value.length }).map((trait) => {
              return (
                <div className="flex flex-col gap-y-1 px-3 py-2 bg-white rounded-xl overflow-hidden ring-1 ring-black ring-opacity-5">
                  <label className="font-semibold text-gray-600 text-center text-sm">{trait.name}</label>
                  <label className="text-center text-sm">{trait.value}</label>
                  {
                    trait.rarity ?
                      <label className="text-gray-400 text-center text-sm">{trait.rarity}</label>
                      : null
                  }
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }

  const getDisplayView = (metadata) => {
    const display = metadata.display
    if (!display) return null
    const collectionDisplay = metadata.collectionDisplay
    const serial = metadata.serial
    const externalURL = metadata.external_url
    const imageSrc = getImageSrcFromMetadataViewsFile(display.thumbnail)
    return (
      <div className="p-4 flex gap-x-5">
        <div className="w-96 shrink-0 shadow-md aspect-square flex justify-center rounded-2xl bg-white relative overflow-hidden ring-1 ring-black ring-opacity-5">
          <Image className={"object-contain"} src={imageSrc} fill alt="" priority sizes="33vw" />
        </div>
        <div className="flex flex-col gap-y-2 justify-between">
          <div className="flex flex-col gap-y-2 items-start">
            {
              collectionDisplay ?
                <label className="font-semibold text-drizzle">{collectionDisplay.name}</label>
                : null
            }
            <label className="font-bold text-black text-3xl">{display.name}</label>
            {
              serial ?
                <label className={`font-bold text-xs px-2 py-1 leading-5 rounded-full bg-gray-100 text-gray-800`}>{`Serial: #${serial.number}`}</label>
                : null
            }
            <label className="text-black text-base">{display.description}</label>
          </div>
          {
            externalURL ?
              <div className="font-semibold">
                {`View on `}
                <a href={externalURL.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-bold decoration-drizzle decoration-2"
                >
                  {new URL(externalURL.url).hostname}
                </a>
              </div>
              : null
          }

        </div>

      </div>
    )
  }

  if (!metadata) {
    return (
      <div>
        LOADING
      </div>
    )
  }

  return (
    <div className={`w-full flex flex-col gap-y-1 pb-2 justify-between shrink-0 overflow-hidden`}>
      {getDisplayView(metadata)}
      {getTraitsView(metadata)}
      {getEditionsView(metadata)}
      {getRoyaltiesView(metadata)}
      {/* <div className="flex justify-center w-full rounded-t-2xl aspect-square bg-drizzle-ultralight relative overflow-hidden">
        <Image className={"object-contain"} src={display.imageSrc || "/token_placeholder.png"} fill alt="" priority sizes="10vw" />
        {
          display.rarity ?
            <div className={`absolute top-2 px-2 ${rarityColor} rounded-full font-flow font-medium text-xs`}>
              {`${display.rarity}`.toUpperCase()}
            </div> : null
        }
      </div>
      <label className="px-3 max-h-12 break-words overflow-hidden text-ellipsis font-flow font-semibold text-xs text-black">
        {`${display.name}`}
      </label>
      <label className="px-3 font-flow font-medium text-xs text-gray-400">
        {`#${display.tokenID}`}
      </label> */}
    </div>
  )
}