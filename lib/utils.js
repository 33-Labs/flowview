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

export const isValidPositiveNumber = (number) => {
  if (!number) { return false }
  try {
    const num = new Decimal(number)
    if (num.isNaN()) { return false }
    if (!num.isPositive()) { return false }
    return true
  } catch (e) {
    return false
  }
}

export const isValidPositiveFlowDecimals = (number) => {
  if (!number) { return false }
  try {
    const num = new Decimal(number)
    if (num.isNaN()) { return false }
    if (!num.isPositive()) { return false }
    if (num.decimalPlaces() > 8) { return false }
    return true
  } catch (e) {
    return false
  }
}

export const isValidUrl = (url) => {
  // 创建一个正则表达式模式，用于匹配 URL
  var pattern = new RegExp('^(https?:\\/\\/)?' + // 协议
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // 域名
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // IP 地址
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // 端口和路径
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // 查询字符串
    '(\\#[-a-z\\d_]*)?$', 'i'); // 锚点

  // 使用正则表达式进行匹配
  return pattern.test(url);
}

// TODO: replace this with fcl.account(address)
export const isValidFlowAddress = (address) => {
  if (!address || !address.startsWith("0x") || address.length != 18) {
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

export const getContractInfoFromTypeId = (typeId) => {
  if (!typeId) { return null }
  const comps = typeId.split(".")
  if (comps.length != 4) {
    return null
  }
  const contractAddress = `0x${comps[1]}`
  const contractName = comps[2]
  return {
    contractAddress: contractAddress,
    contractName: contractName
  }
}

export const getCollectionStoragePath = (metadata) => {
  const { domain, identifier } = metadata.collectionData.storagePath
  const collectionStoragePath = `/${domain}/${identifier}`
  return collectionStoragePath
}

export const getIPFSFileURL = (cid, path) => {
  if (!cid) { return }
  // cid v0
  let v1 = cid
  if (cid.startsWith("Qm")) {
    v1 = CID.parse(cid).toV1().toString()
  }

  // https://ipfs.github.io/public-gateway-checker/
  const rndInt = Math.floor(Math.random() * 2) + 1
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
  }
  console.log(res)

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
  } else if (file.url.includes('data:image/')) {
    return file.url
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
    let storagePathIdentifier = c.collectionData.storagePath.identifier
    let publicPathIdentifier = c.collectionData.publicPath.identifier

    return { ...c, contract: contract, contractName: contractName, storagePathIdentifier: storagePathIdentifier, publicPathIdentifier: publicPathIdentifier }
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
      collection.uuid = `A.${collection.contractAddress.replace("0x", "")}.${collection.contractName}`
    }
    collection.addedCatalogInfo = true
    newCollections.push(collection)
  }
  return newCollections
}

export const getContractLink = (contractUUID) => {
  if (publicConfig.chainEnv == "mainnet" || publicConfig.chainEnv == "testnet") {
    return `${publicConfig.contractbrowserURL}/${contractUUID}`
  } else {
    return `${publicConfig.flowscanURL}/contract/${contractUUID}`
  }
}

export const getFlowverseLink = (contractName) => {
  return `https://nft.flowverse.co/marketplace/${contractName}`
}

export const getFlowtyLink = (contractAddress, contractName) => {
  return `https://www.flowty.io/collection/${contractAddress}/${contractName}`
}

export const formatTypeID = (typeID) => {
  // e.g. A.631e88ae7f1d7c20.NonFungibleToken .CollectionPublic
  const contract = getContract(typeID)
  const url = getContractLink(contract)
  const rest = typeID.replace(contract, "")
  return (
    <label>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-bold decoration-drizzle decoration-2">
        {contract}
      </a>{`${rest}`}
    </label>
  )
}

// Copied from https://github.com/bluesign/flow-view-source
// SEE: https://github.com/bluesign/flow-view-source/blob/76b57651684c0d744e69bf781965681af9494acc/src/util/fmt-flow.util.js#L18
export const cadenceValueToDict = (payload, brief) => {
  if (!payload) return null

  if (payload["type"] === "Array") {
    return cadenceValueToDict(payload["value"], brief)
  }

  if (payload["type"] === "Dictionary") {
    var resDict = {}
    payload["value"].forEach(element => {
      var skey = cadenceValueToDict(element["key"], brief)
      if (brief && skey) {
        if (skey.toString().indexOf("A.") === 0) {
          skey = skey.toString().split(".").slice(2).join(".")
        }
        resDict[skey] = cadenceValueToDict(element["value"], brief)
      } else {
        resDict[cadenceValueToDict(element["key"], brief)] = cadenceValueToDict(element["value"], brief)
      }
    });
    return resDict
  }

  if (payload["kind"] === "Reference") {
    return "&" + payload["type"]["typeID"]
  }

  if (payload["type"] === "Optional") {
    return cadenceValueToDict(payload["value"], brief)
  }
  if (payload["type"] === "Type") {
    return cadenceValueToDict(payload["value"]["staticType"], brief)
  }

  if (payload["type"] === "Address") {
    return payload["value"]
  }

  if (payload["kind"] && payload["kind"] === "Capability") {
    return payload["type"]["type"]["typeID"]
  }
  if (payload["type"] === "Capability") {
    var res = {}
    res["address"] = payload["value"]["address"]
    res["path"] = cadenceValueToDict(payload["value"]["path"], brief)
    res["borrowType"] = cadenceValueToDict(payload["value"]["borrowType"], brief)
    return { "<Capability>": res }
  }

  if (payload["type"] === "Path") {
    return payload["value"]["domain"] + "/" + payload["value"]["identifier"]
  }

  if (payload["type"] === "UInt64") {
    return payload["value"]
  }

  if (payload["type"] && payload["type"].indexOf("Int") > -1) {
    return parseInt(payload["value"])
  }

  if (Array.isArray(payload)) {
    var resArray = []
    for (const i in payload) {
      resArray.push(cadenceValueToDict(payload[i], brief))
    }
    return resArray
  }

  if (payload["type"] === "Struct" || payload["type"] === "Resource") {
    return cadenceValueToDict(payload["value"], brief)
  }

  if (payload["id"] != null && (payload["id"].indexOf("A.") === 0 || payload["id"].indexOf("s.") === 0)) {
    res = {}
    for (const f in payload["fields"]) {
      res[payload["fields"][f]["name"]] = cadenceValueToDict(payload["fields"][f]["value"], brief)
    }
    var res2 = {}
    if (brief) {
      res2[payload["id"].split(".").slice(2).join(".")] = res
    }
    else {
      res2[payload["id"]] = res
    }
    return res2
  }

  return payload["value"]

}