import * as fcl from "@onflow/fcl"
import { txHandler } from "./transactions"

export const setupSwitchboard = async (
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doSetupSwitchboard()
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doSetupSwitchboard = async () => {
  const code = await (await fetch("/transactions/switchboard/setup.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const addNewVault = async (
  tokenReceiverPath,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doAddNewVault(tokenReceiverPath)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doAddNewVault = async (tokenReceiverPath) => {
  let code = await (await fetch("/transactions/switchboard/add_new_vault.cdc")).text()
  code = code.replace('__TOKEN_RECEIVER_PATH__', tokenReceiverPath)

  const transactionId = fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const removeVault = async (
  tokenReceiverPath,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doRemoveVault(tokenReceiverPath)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doRemoveVault = async (tokenReceiverPath) => {
  let code = await (await fetch("/transactions/switchboard/remove_vault.cdc")).text()
  code = code.replace('__TOKEN_RECEIVER_PATH__', tokenReceiverPath)

  const transactionId = fcl.mutate({
    cadence: code,
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}