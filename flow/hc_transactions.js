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
  const code = await (await fetch("/transactions/linked_accounts/setup_owned_account_and_publish_to_parent.cdc")).text()

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
  const code = await (await fetch("/transactions/linked_accounts/setup_owned_account.cdc")).text()

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