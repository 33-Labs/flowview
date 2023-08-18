import * as fcl from "@onflow/fcl"
import { txHandler } from "./transactions"

export const setupOwnedAccountAndPublishToParent = async (
  parent, name, desc, thumbnail,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doSetupOwnedAccountAndPublishToParent(parent, name, desc, thumbnail)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doSetupOwnedAccountAndPublishToParent = async (parent, name, desc, thumbnail) => {
  const code = await (await fetch("/transactions/hc/setup_owned_account_and_publish_to_parent.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(parent, t.Address),
      arg(name, t.Optional(t.String)),
      arg(desc, t.Optional(t.String)),
      arg(thumbnail, t.Optional(t.String))
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const setupOwnedAccount = async (
  name, desc, thumbnail,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doSetupOwnedAccount(name, desc, thumbnail)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doSetupOwnedAccount = async (name, desc, thumbnail) => {
  const code = await (await fetch("/transactions/hc/setup_owned_account.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(name, t.Optional(t.String)),
      arg(desc, t.Optional(t.String)),
      arg(thumbnail, t.Optional(t.String))
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const publishToParent = async (
  parent, factory, filter,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doPublishToParent(parent, factory, filter)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doPublishToParent = async (parent, factory, filter) => {
  const code = await (await fetch("/transactions/hc/publish_to_parent.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(parent, t.Address),
      arg(factory, t.Address),
      arg(filter, t.Address)
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const removeParentFromChild = async (
  parent,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doRemoveParentFromChild(parent)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doRemoveParentFromChild = async (parent) => {
  const code = await (await fetch("/transactions/hc/remove_parent_from_child.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(parent, t.Address)
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const setupHcManager = async (
  filter, filterPath,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doSetupHcManager(filter, filterPath)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doSetupHcManager = async (filter, filterPath) => {
  const code = await (await fetch("/transactions/hc/setup_hc_manager.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(filter, t.Optional(t.Address)),
      arg(filterPath, t.Optional(t.String)),
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const redeemAccount = async (
  childAddress,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doRedeemAccount(childAddress)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doRedeemAccount = async (childAddress) => {
  const code = await (await fetch("/transactions/hc/redeem_account.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(childAddress, t.Address)
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}
