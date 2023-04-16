import * as fcl from "@onflow/fcl"
import { txHandler } from "./transactions"

export const addOrEditAccountBookmark = async (
  address, note,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doAddOrEditAccountBookmark(address, note)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doAddOrEditAccountBookmark = async (address, note) => {
  const code = await (await fetch("/transactions/bookmark/account/add_or_edit_bookmark.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(note, t.String)
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const removeAccountBookmark = async (
  address,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doRemoveAccountBookmark(address)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doRemoveAccountBookmark = async (address) => {
  const code = await (await fetch("/transactions/bookmark/account/remove_bookmark.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}
