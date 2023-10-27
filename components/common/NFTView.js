import Image from "next/image"
import { classNames, getRarityColor } from "../../lib/utils"
import { useRouter } from "next/router"
import { basicNotificationContentState, showBasicNotificationState } from "../../lib/atoms"
import { useRecoilState } from "recoil"

export default function NFTView(props) {
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const { account, collection, display, selectMode, tokenId, selectedTokens, setSelectedTokens } = props
  const isSelected = (selectMode == "Select" && selectedTokens && selectedTokens[tokenId] && selectedTokens[tokenId].isSelected == true) ? true : false
  const router = useRouter()
  const rarityColor = getRarityColor(display.rarity ? display.rarity.toLowerCase() : null)
  const maxSelection = 20
  return (
    <div className={
      classNames(
        isSelected ? `ring-2 ring-drizzle` : `ring-1 ring-black ring-opacity-5`,
        `w-36 h-60 bg-white rounded-2xl flex flex-col gap-y-1 pb-2 justify-between items-center shrink-0 overflow-hidden shadow-md`
      )}
      onClick={() => {
        if (selectMode == "Detail") {
          router.push({
            pathname: `${router.pathname}/[token_id]`,
            query: {
              account: account,
              collection: collection.path.replace("/storage/", ""),
              token_id: display.tokenID
            }
          }, undefined, { shallow: true })
        } else {
          if (display.transferrable == false) {
            setShowBasicNotification(true)
            setBasicNotificationContent({ type: "exclamation", title: `This NFT is not transferrable`, detail: null })
            return
          }
          let tokens = Object.assign({}, selectedTokens)
          if (!tokens[tokenId] || tokens[tokenId].isSelected == false) {
            if (Object.values(selectedTokens).filter((t) => t.isSelected == true).length >= maxSelection) {
              setShowBasicNotification(true)
              setBasicNotificationContent({ type: "exclamation", title: `You can select ${maxSelection} NFTs at most`, detail: null })
            } else {
              tokens[tokenId] = { isSelected: true, selectedAt: new Date().getTime(), display: display, recipient: null }
            }
          } else {
            tokens[tokenId] = { isSelected: false, selectedAt: 0, display: display, recipient: null }
          }
          setSelectedTokens(tokens)
        }
      }}>
      <div className="flex justify-center w-full rounded-t-2xl aspect-square bg-drizzle-ultralight relative overflow-hidden">
        <Image className={"object-contain"} src={display.imageSrc || "/token_placeholder.png"} fill alt="" priority sizes="5vw" />
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
      <div className="flex flex-col items-center justify-center">
        <div className="flex gap-x-1 justify-center items-center">
          {
            display.transferrable == true ? null :
              <div className={`w-4 h-4 text-center bg-indigo-100 text-indigo-800 rounded-full font-flow font-medium text-xs`}>
                {"S"}
              </div>
          }
          <label className="font-flow font-medium text-xs text-gray-400">
            {`#${display.tokenID}`}
          </label>
        </div>
        {
          selectMode == "Select" && selectedTokens[tokenId] && selectedTokens[tokenId].isSelected && selectedTokens[tokenId].recipient ?
            <div className={`px-1 h-4 text-center bg-indigo-100 text-indigo-800 rounded-full font-flow font-medium text-xs`}>
              {selectedTokens[tokenId].recipient}
            </div>
            : null
        }
      </div>
    </div>
  )
}