import * as fcl from "@onflow/fcl"
import { txHandler } from "./transactions"

export const setupOwnedAccountAndPublishToParent = async (
  parent, name, desc, thumbnail,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doSetupDisplayAndPublishToParent(parent, name, desc, thumbnail)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doSetupDisplayAndPublishToParent = async (parent, name, desc, thumbnail) => {
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

export const acceptOwnership = async (
  childAddress,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doAcceptOwnership(childAddress)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doAcceptOwnership = async (childAddress) => {
  const code = await (await fetch("/transactions/hc/accept_ownership.cdc")).text()

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

export const setupChildAccountDisplay = async (
  childAddress, name, desc, thumbnail,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doSetupChildAccountDisplay(childAddress, name, desc, thumbnail)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doSetupChildAccountDisplay = async (childAddress, name, desc, thumbnail) => {
  const code = await (await fetch("/transactions/hc/setup_child_display.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(childAddress, t.Address),
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

export const removeChildAccount = async (
  childAddress,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doRemoveChildAccount(childAddress)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doRemoveChildAccount = async (childAddress) => {
  const code = await (await fetch("/transactions/hc/remove_child_account.cdc")).text()

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

export const transferOwnership = async (
  ownerAddress,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doTransferOwnership(ownerAddress)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doTransferOwnership = async (ownerAddress) => {
  const code = await (await fetch("/transactions/hc/transfer_ownership.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(ownerAddress, t.Address)
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const transferOwnershipFromManager = async (
  ownedAddress,
  ownerAddress,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doTransferOwnershipFromManager(ownedAddress, ownerAddress)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doTransferOwnershipFromManager = async (ownedAddress, ownerAddress) => {
  const code = await (await fetch("/transactions/hc/transfer_ownership_from_manager.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(ownedAddress, t.Address),
      arg(ownerAddress, t.Address)
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}

export const setManagerCapabilityFilter = async (
  childAddress,
  filterAddress,
  setTransactionInProgress,
  setTransactionStatus
) => {
  const txFunc = async () => {
    return await doSetManagerCapabilityFilter(childAddress, filterAddress)
  }

  return await txHandler(txFunc, setTransactionInProgress, setTransactionStatus)
}

const doSetManagerCapabilityFilter = async (childAddress, filterAddress) => {
  const code = await (await fetch("/transactions/hc/set_manager_capability_filter.cdc")).text()

  const transactionId = fcl.mutate({
    cadence: code,
    args: (arg, t) => [
      arg(childAddress, t.Address),
      arg(filterAddress, t.Address)
    ],
    proposer: fcl.currentUser,
    payer: fcl.currentUser,
    limit: 9999
  })

  return transactionId
}