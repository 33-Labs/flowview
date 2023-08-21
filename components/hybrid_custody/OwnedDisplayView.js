import Image from "next/image"
import publicConfig from "../../publicConfig"
import { getImageSrcFromMetadataViewsFile } from "../../lib/utils"

export default function OwnedDisplayView(props) {
  const { display, style } = props

  if (style == "Small") {
    return (
      <div className="flex gap-x-3 justify-between">
        <div className="flex items-center gap-x-3">
          <div className="w-10 rounded-full overflow-hidden aspect-square relative shrink-0">
            <Image src={getImageSrcFromMetadataViewsFile(display.thumbnail)} alt="" fill sizes="5vw" />
          </div>
          <div className="flex flex-col">
            <label className="text-medium font-semibold">
              {`${display.name}`}
            </label>
            <label className="text-sm font-medium text-gray-600">
              {`${display.description}`}
            </label>
          </div>
        </div>
      </div>
    )
  }

  return (
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
  )
}