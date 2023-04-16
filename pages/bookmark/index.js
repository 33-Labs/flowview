import AccountBookmark from "../../components/bookmark/AccountBookmark"
import { getBookmarks } from "../../flow/bookmark_scripts"
import useSWR, { useSWRConfig } from "swr"
import { useRecoilState } from "recoil"
import { useRouter } from "next/router";
import * as fcl from "@onflow/fcl";
import { useEffect, useState } from "react";
import publicConfig from "../../publicConfig";
import {
  showBasicNotificationState,
  basicNotificationContentState,
  currentDefaultDomainsState,
  transactionStatusState,
  transactionInProgressState
} from "../../lib/atoms"
import Spinner from "../../components/common/Spinner";
import NoteEditorModal from "../../components/bookmark/NoteEditorModal";

const accountBookmarksFetcher = async (funcName, address) => {
  if (publicConfig.chainEnv == "emulator") {
    return null
  }
  const bookmarks = await getBookmarks(address)
  return bookmarks
}

export default function Bookmark() {
  const [, setShowBasicNotification] = useRecoilState(showBasicNotificationState)
  const [, setBasicNotificationContent] = useRecoilState(basicNotificationContentState)
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const { mutate } = useSWRConfig()
  const router = useRouter()

  const [user, setUser] = useState({ loggedIn: null })
  const [accountBookmarks, setAccountBookmarks] = useState(null)

  useEffect(() => fcl.currentUser.subscribe(setUser), [])

  const { data: accountBookmarksData, error: accountBookmarksError} = useSWR(
    user && user.loggedIn ? ["accountBookmarksFetcher", user.addr] : null, accountBookmarksFetcher
  )

  useEffect(() => {
    if (accountBookmarksError) {
      return
    }

    if (accountBookmarksData) {
      const bookmarks = Object.values(accountBookmarksData).sort((a, b) => {
        return a.address - b.address
      })
      setAccountBookmarks(bookmarks)
    } else {
      setAccountBookmarks([])
    }
  }, [accountBookmarksData])


  const showAccountBookmarks = () => {
    if (!(user && user.loggedIn)) {
      return (
        <div className="flex mt-10 h-[168px] text-gray-400 text-base justify-center">
          Connect wallet to view your bookmarks.
        </div>
      )
    }

    if (!accountBookmarksData && !accountBookmarksError) {
      return (
        <div className="flex mt-10 h-[168px] justify-center">
          <Spinner />
        </div>
      )
    }

    if (accountBookmarks.length == 0) {
      return (
        <div className="flex mt-10 h-[168px] text-gray-400 text-base justify-center">
         You have no bookmarks yet.
        </div>
      )
    }

    return (
      <div className="p-1 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5 w-full">
        {
          accountBookmarks.map((bookmark, index) => {
            return <AccountBookmark key={`bm-${index}`} bookmark={bookmark} user={user} />
          })
        }
      </div>
    )
  }

  return (
    <>
    <div className="container mx-auto max-w-7xl min-w-[380px] px-6">
      {showAccountBookmarks()}
    </div>
    <NoteEditorModal />
    </>
  )
}