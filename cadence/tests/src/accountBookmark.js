import { 
  sendTransaction,
  executeScript
} from "@onflow/flow-js-testing"

// transactions

export const addAccountBookmark = async (signer, address, note) => {
  const signers = [signer]
  const params = [address, note]
  const txName = "add_bookmark"
  return await sendTransaction({ name: txName, signers: signers, args: params})
}

export const editAccountBookmark = async (signer, address, note) => {
  const signers = [signer]
  const params = [address, note]
  const txName = "edit_bookmark"
  return await sendTransaction({ name: txName, signers: signers, args: params})
}

export const removeAccountBookmark = async (signer, address) => {
  const signers = [signer]
  const params = [address]
  const txName = "remove_bookmark"
  return await sendTransaction({ name: txName, signers: signers, args: params})
}

// scripts

export const getBookmark = async (owner, address) => {
  const name = "get_bookmark"
  const args = [owner, address]
  return await executeScript({ name: name, args: args })
}

export const getBookmarks = async (owner) => {
  const name = "get_bookmarks"
  const args = [owner]
  return await executeScript({ name: name, args: args })
}
