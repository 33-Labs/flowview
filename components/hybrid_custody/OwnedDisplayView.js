import Image from "next/image"
import publicConfig from "../../publicConfig"
import { getImageSrcFromMetadataViewsFile } from "../../lib/utils"

export default function OwnedDisplayView(props) {
  const { display } = props

  return (
    <div className="flex flex-col max-w-[1094px] min-w-[1076px] gap-y-3 p-4 shadow-md rounded-2xl bg-white">
      <div className="flex gap-x-3 justify-between">
        <div className="flex items-center gap-x-3">
          <div className="w-20 rounded-full overflow-hidden aspect-square relative">
            <Image src={getImageSrcFromMetadataViewsFile(display.thumbnail)} alt="" fill sizes="5vw" />
          </div>
          <div className="flex flex-col w-full">
            <label className="text-lg font-bold">
              {`${display.name}`}
            </label>
            <label className="text-sm font-medium text-gray-600">
              {`${display.description}`}
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}