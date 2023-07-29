import * as fcl from "@onflow/fcl"
import { txHandler } from "./transactions"

export const setupAccount = async (
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doSetupAccount()
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doSetupAccount = async () => {
  const code = await (await fetch("/transactions/storefront/setup_account.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const cleanupGhosted = async (
  account,
  listingIds,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doCleanupGhosted(account, listingIds)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doCleanupGhosted = async (account, listingIds) => {
  const code = await (await fetch("/transactions/storefront/cleanup_ghosted.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(account, t.Address),
      arg(listingIds, t.Array(t.UInt64))
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const cleanupPurchased = async (
  account,
  listingIds,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doCleanupPurchased(account, listingIds)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doCleanupPurchased = async (account, listingIds) => {
  const code = await (await fetch("/transactions/storefront/cleanup_purchased.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(account, t.Address),
      arg(listingIds, t.Array(t.UInt64))
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}


export const cleanupExpired = async (
  account,
  fromIndex, toIndex,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doCleanupExpired(account, fromIndex, toIndex)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doCleanupExpired = async (account, fromIndex, toIndex) => {
  const code = await (await fetch("/transactions/storefront/cleanup_expired.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(account, t.Address),
      arg(fromIndex, t.UInt64),
      arg(toIndex, t.UInt64)
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}