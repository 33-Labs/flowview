import Image from "next/image"

export default function NFTDisplay(props) {
  const { display } = props
  return (
    <div className="w-32 h-52 bg-white rounded-2xl flex flex-col gap-y-1 pb-2 justify-between items-center shrink-0 overflow-hidden shadow-md ring-1 ring-black ring-opacity-5">
      <div className="w-full aspect-square bg-drizzle-ultralight relative">
        <Image className={"object-contain"} src={display.imageSrc || "/token_placeholder.png"} fill alt="" priority sizes="33vw" />
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