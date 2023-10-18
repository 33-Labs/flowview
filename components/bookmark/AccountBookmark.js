import { useRouter } from "next/router";
import { StarIcon as SolidStar } from "@heroicons/react/solid"
import { useRecoilState } from "recoil"
import { useSWRConfig } from "swr"
import {
  transactionStatusState,
  showNoteEditorState,
  accountBookmarkState,
  transactionInProgressState,
  showBasicNotificationState,
  basicNotificationContentState
} from "../../lib/atoms"
import { removeAccountBookmark } from "../../flow/bookmark_transactions";
import { DocumentDuplicateIcon, PencilAltIcon } from "@heroicons/react/outline";

export default function AccountBookmark(props) {
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)
  const [showNoteEditor, setShowNoteEditor] = useRecoilState(showNoteEditorState)
  const [accountBookmark, setAccountBookmark] = useRecoilState(accountBookmarkState)

  const router = useRouter()
  const { user, bookmark } = props

  const { mutate } = useSWRConfig()

  return (
    <div className="p-5 flex flex-col gap-y-2 bg-white shadow-md rounded-lg">
      <div className="flex gap-x-2 items-center justify-between">
        <div className="text-drizzle text-xl font-bold cursor-pointer"
          onClick={() => {
            if (transactionInProgress) {
              return
            }

            router.push({
              pathname: `/account/${bookmark.address}`
            }, undefined, { shallow: true })
          }}
        >{bookmark.address}</div>
        <div className="flex gap-x-1 items-center justify-center">
          <DocumentDuplicateIcon className="cursor-pointer text-gray-700 hover:text-drizzle w-5 h-5"
            onClick={async () => {
              await navigator.clipboard.writeText(bookmark.address)
              setShowBasicNotification(true)
              setBasicNotificationContent({ type: "information", title: "Copied!", detail: null })
            }} />
          <SolidStar className="text-yellow-400 w-6 h-6 cursor-pointer"
            onClick={async () => {
              if (transactionInProgress) {
                return
              }
              await removeAccountBookmark(bookmark.address, setTransactionInProgress, setTransactionStatus)
              mutate(["accountBookmarksFetcher", user.addr])
            }} />
        </div>

      </div>
      <div className="flex gap-x-2 items-center justify-between">
        <div>{bookmark.note}</div>
        <PencilAltIcon className="text-gray-700 min-w-[20px] w-5 h-5 cursor-pointer"
          onClick={() => {
            if (transactionInProgress) {
              return
            }

            setAccountBookmark({
              address: bookmark.address,
              note: bookmark.note
            })
            setShowNoteEditor(true)
          }}
        />
      </div>
    </div>
  )
}