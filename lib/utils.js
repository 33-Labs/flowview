import Decimal from "decimal.js"
import { CID } from 'multiformats/cid'
import publicConfig from "../publicConfig"

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

export const isValidStoragePath = (path) => {
  if (!path.startsWith("/storage/")) { return false }
  const comps = path.split("/")
  if (comps.length != 3) { return false }
  return true
}

export const isValidFlowContract = (contract) => {
  if (!contract.startsWith("A.")) {
    return false
  }

  const comps = contract.split(".")
  if (comps.length != 3) { return false }
  if (!isValidFlowAddress(`0x${comps[1]}`)) { return false }
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

export const getCapabilityRestrictions = (type) => {
  if (type.kind == "Restriction") {
    return type.restrictions.map((r) => {
      return r.typeID
    })
  }
  if (!type.type) return null
  return getCapabilityRestrictions(type.type)
}

export const getContract = (typeID) => {
  const comps = typeID.split(".")
  const contract = [comps[0], comps[1], comps[2]].join(".")
  return contract
}

export const getIPFSFileURL = (cid, path) => {
  if (!cid) { return }
  // cid v0
  let v1 = cid
  if (cid.startsWith("Qm")) {
    v1 = CID.parse(cid).toV1().toString()
  }

  // https://ipfs.github.io/public-gateway-checker/
  const rndInt = Math.floor(Math.random() * 3) + 1
  let res = ""
  if (rndInt == 1) {
    if (!path) {
      res = `https://gateway.pinata.cloud/ipfs/${v1}`
    } else {
      res = `https://gateway.pinata.cloud/ipfs/${v1}/${path}`
    }
  } else if (rndInt == 2) {
    if (!path) {
      res = `https://cloudflare-ipfs.com/ipfs/${v1}`
    } else {
      res = `https://cloudflare-ipfs.com/ipfs/${v1}/${path}`
    }
  } else if (!path) {
    res = `https://ipfs.fleek.co/ipfs/${v1}`
  } else {
    res = `https://ipfs.fleek.co/ipfs/${v1}/${path}`
  }
  return res
}

export const getIPFSFileURLByURL = (url) => {
  if (!url.includes("ipfs://")) { return }
  const path = url.replace("ipfs://", "")
  const comps = path.split("/")
  if (comps.length != 2) {
    return `https://gateway.pinata.cloud/ipfs/${path}`
  }
  return getIPFSFileURL(comps[0], comps[1])
}

export const getImageSrcFromMetadataViewsFile = (file) => {
  if (!file) return "/token_placeholder.png" 
  if (file.url && file.url.includes("https://") && !file.url.includes("ipfs://")) {
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

// Collection

export const getRarityColor = (rarity) => {
  if (rarity == "rare") {
    return "text-blue-800 bg-blue-100"
  } else if (rarity == "epic") {
    return "text-yellow-800 bg-yellow-100"
  } else if (rarity == "legendary") {
    return "text-purple-800 bg-purple-100"
  } else {
    return "text-gray-800 bg-gray-100"
  }
}

export const collectionsWithExtraData = (collections) => {
  return collections.map((c) => {
    if (c.collectionIdentifier) {
      return c
    }

    let resourceType = getResourceType(c.type)
    let contract = c.path.replace("/storage/", "")
    let contractName = contract
    if (resourceType != "AnyResource") {
      contract = getContract(resourceType)
      let comps = contract.split(".")
      contractName = comps[comps.length - 1]
    }

    return { ...c, contract: contract, contractName: contractName }
  })
}

export const collectionsWithDisplayInfo = (collections) => {
  const newCollections = []
  for (let i = 0; i < collections.length; i++) {
    const collection = Object.assign({}, collections[i])
    if (collection.display) {
      collection.name = collection.display.name
      collection.squareImage = collection.display.squareImage
    }
    newCollections.push(collection)
  }
  return newCollections
}

export const collectionsWithCatalogInfo = (collections, nftCatalog) => {
  const catalogPathMap = {}
  for (const [collectionID, catalog] of Object.entries(nftCatalog)) {
    const path = catalog.collectionData.storagePath
    catalogPathMap[`/${path.domain}/${path.identifier}`] = {
      collectionIdentifier: collectionID,
      catalog: catalog
    }
  }

  const newCollections = []
  for (let i = 0; i < collections.length; i++) {
    const collection = Object.assign({}, collections[i])
    const catalogInfo = catalogPathMap[collection.path]
    if (catalogInfo) {
      collection.collectionIdentifier = catalogInfo.collectionIdentifier
      collection.name = catalogInfo.catalog.collectionDisplay.name
      collection.squareImage = catalogInfo.catalog.collectionDisplay.squareImage
      collection.socials = catalogInfo.catalog.collectionDisplay.socials
      collection.externalURL = catalogInfo.catalog.collectionDisplay.externalURL
      collection.description = catalogInfo.catalog.collectionDisplay.description
      collection.contractName = catalogInfo.catalog.contractName
      collection.contractAddress = catalogInfo.catalog.contractAddress
      collection.publicPathIdentifier = catalogInfo.catalog.collectionData.publicPath.identifier
      collection.uuid = `A.${collection.contractAddress.replace("0x", "")}.${collection.contractName}`
    }
    collection.addedCatalogInfo = true
    newCollections.push(collection)
  }
  return newCollections
}

export const getContractLink = (contractUUID) => {
  if (publicConfig.chainEnv == "mainnet") {
    return `https://contractbrowser.com/${contractUUID}`
  } else {
    return `${publicConfig.flowscanURL}/contract/${contractUUID}`
  }
}