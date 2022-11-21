import Decimal from "decimal.js";

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

export const isValidPublicKey = (pubkey) => {
  const bytes = Buffer.from(pubkey.replace("0x", ""), "hex")
  if (bytes.length != 64) { return false }
  return true
}

export const maybeDomain = (domain) => {
  const roots = [".fn", ".find", ".meow"]
  if (!roots.some((root) => domain.endsWith(root))) return false
  const comps = domain.split(".")
  return comps.length == 2
}

export const isValidFlowAddress = (address) => {
  if (!address.startsWith("0x") || address.length != 18) {
    return false
  }

  const bytes = Buffer.from(address.replace("0x", ""), "hex")
  if (bytes.length != 8) { return false }
  return true
}

export const percentage = (a, b) => {
  const p = new Decimal(a).div(new Decimal(b)).mul(new Decimal(100)).toFixed(2)
  return `${p.toString()}%`
}

export const getItemsInPage = (totalItems, page, pageSize) => {
  const items = totalItems.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
  return items
}

export const getResourceType = (type) => {
  if (!type) return null
  if (type.kind == "Resource") return type.typeID
  if (type.kind == "AnyResource") return "AnyResource"
  if (!type.type) return null
  return getResourceType(type.type)
}

export const getContract = (typeID) => {
  const comps = typeID.split(".")
  const contract = [comps[0], comps[1], comps[2]].join(".")
  return contract
}

export const getIPFSFileURL = (cid, path) => {
  if (!cid) { return }
  if (!path) {
    return `https://gateway.pinata.cloud/ipfs/${cid}`
  }
  return `https://gateway.pinata.cloud/ipfs/${cid}/${path}`
}

export const getIPFSFileURLByURL = (url) => {
  if (!url.includes("ipfs://")) { return }
  const newURL = url.replace("ipfs://", "")
  return `https://gateway.pinata.cloud/ipfs/${newURL}`
}

export const getImageSrcFromMetadataViewsFile = (file) => {
  if (file.url && file.url.trim() != '' && !file.url.includes("ipfs://")) {
    return file.url.trim()
  } else if (file.url && file.url.includes("ipfs://")) {
    return getIPFSFileURLByURL(file.url)
  } else if (file.cid && file.cid.trim() != '') {
    if (file.path && file.path.trim() != '') {
      const imageCID = file.cid.trim()
      const imagePath = file.path.trim()
      return getIPFSFileURL(imageCID, imagePath)
    } else {
      return getIPFSFileURL(file.cid.trim(), null)
    }
  } else {
    return "/token_placeholder.png" 
  }
}