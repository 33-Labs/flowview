import * as fcl from "@onflow/fcl"

export const getBookmark = async (owner, target) => {
  const code = await (await fetch("/scripts/bookmark/account/get_bookmark.cdc")).text()

  const result = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(owner, t.Address),
      arg(target, t.Address)
    ]
  })

  return result
}

export const getBookmarks = async (owner) => {
  const code = await (await fetch("/scripts/bookmark/account/get_bookmarks.cdc")).text()

  const result = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(owner, t.Address)
    ]
  })

  return result
}