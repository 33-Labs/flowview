import * as fcl from "@onflow/fcl"
import { txHandler } from "./transactions"
import Decimal from "decimal.js"
import publicConfig from "../publicConfig"

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

export const sellItem = async (
  contractName, contractAddress, collectionStoragePath, collectionPublicPath,
  saleItemID, saleItemPrice, days,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doSellItem(contractName, contractAddress, collectionStoragePath, collectionPublicPath, saleItemID, saleItemPrice, days)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doSellItem = async (contractName, contractAddress, collectionStoragePath, collectionPublicPath, saleItemID, saleItemPrice, days) => {
  let code = await (await fetch("/transactions/storefront/sell_item.cdc")).text()
  code = code
    .replaceAll("__NFT_CONTRACT_NAME__", contractName)
    .replaceAll("__NFT_CONTRACT_ADDRESS__", contractAddress)
    .replaceAll("__NFT_COLLECTION_STORAGE_PATH__", collectionStoragePath)
    .replaceAll("__NFT_COLLECTION_PUBLIC_PATH__", collectionPublicPath)

  let price = new Decimal(saleItemPrice).toFixed(8)
  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(saleItemID, t.UInt64),
      arg(price, t.UFix64),
      arg(days, t.UInt64)
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const removeItem = async (
  listingResourceId,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doRemoveItem(listingResourceId)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doRemoveItem = async (listingResourceId) => {
  const code = await (await fetch("/transactions/storefront/remove_item.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(listingResourceId, t.UInt64)
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const buyItem = async (
  contractName, contractAddress, collectionStoragePath,
  listingResourceId, storefrontAddress,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doBuyItem(contractName, contractAddress, collectionStoragePath, listingResourceId, storefrontAddress)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doBuyItem = async (contractName, contractAddress, collectionStoragePath, listingResourceId, storefrontAddress) => {
  let code = await (await fetch("/transactions/storefront/buy_item.cdc")).text()
  code = code
    .replaceAll("__NFT_CONTRACT_NAME__", contractName)
    .replaceAll("__NFT_CONTRACT_ADDRESS__", contractAddress)
    .replaceAll("__NFT_COLLECTION_STORAGE_PATH__", collectionStoragePath)

  const commissionRecipient = publicConfig.accountBookmarkAddress
  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(listingResourceId, t.UInt64),
      arg(storefrontAddress, t.Address),
      arg(commissionRecipient, t.Optional(t.Address)),
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}