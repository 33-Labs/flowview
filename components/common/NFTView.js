import Image from "next/image"
import { getRarityColor } from "../../lib/utils"

export default function NFTView(props) {
  const { display } = props
  const rarityColor = getRarityColor(display.rarity ? display.rarity.toLowerCase() : null)
  return (
    <div className={`w-36 h-60 bg-white rounded-2xl flex flex-col gap-y-1 pb-2 justify-between items-center shrink-0 overflow-hidden shadow-md ring-1 ring-black ring-opacity-5`}>
      <div className="flex justify-center w-full rounded-t-2xl aspect-square bg-drizzle-ultralight relative overflow-hidden">
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
      </label>
    </div>
  )
}