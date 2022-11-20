import Decimal from "decimal.js";

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ')
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
  if (!type.type) return null
  return getResourceType(type.type)
}

export const getContract = (typeID) => {
  const comps = typeID.split(".")
  const contract = [comps[0], comps[1], comps[2]].join(".")
  return contract
}

export const getIPFSFileURL = (cid, path) => {
  if (!cid || !path) { return }
  return `https://gateway.pinata.cloud/ipfs/${cid}/${path}`
}

export const getIPFSFileURLByURL = (url) => {
  if (!url.includes("ipfs://")) { return }
  const newURL = url.replace("ipfs://", "")
  return `https://gateway.pinata.cloud/ipfs/${newURL}`
}

export const getSquareImageSrc = (squareImage) => {
  let src = null
  let squareImageFile = squareImage.file
  if (squareImageFile.url && squareImageFile.url.trim() != '' && !squareImageFile.url.includes("ipfs://")) {
    src = squareImageFile.url.trim()
    return src
  } else if (squareImageFile.url && squareImageFile.url.includes("ipfs://")) {
    return getIPFSFileURLByURL(squareImageFile.url)
  } else if (squareImageFile.cid
    && squareImageFile.cid.trim() != ''
    && squareImageFile.path
    && squareImageFile.path.trim() != '') {
    const imageCID = squareImageFile.cid.trim()
    const imagePath = squareImageFile.path.trim()
    return getIPFSFileURL(imageCID, imagePath)
  } else {
    return "/token_placeholder.png"
  }
}