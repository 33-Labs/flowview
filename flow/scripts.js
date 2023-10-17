import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import { outdatedPathsMainnet } from "./outdated_paths/mainnet"
import { outdatedPathsEmulator, outdatedPathsTestnet } from "./outdated_paths/testnet"
import { cadenceValueToDict } from "../lib/utils"

const outdatedPaths = (network) => {
  if (network == "mainnet") {
    return outdatedPathsMainnet
  } 
  if (network == "testnet") {
    return outdatedPathsTestnet
  }
  return outdatedPathsEmulator
}

// --- Utils ---

const splitList = (list, chunkSize) => {
  const groups = []
  let currentGroup = []
  for (let i = 0; i < list.length; i++) {
    const collectionID = list[i]
    if (currentGroup.length >= chunkSize) {
      groups.push([...currentGroup])
      currentGroup = []
    }
    currentGroup.push(collectionID)
  }
  groups.push([...currentGroup])
  return groups
}

// --- Basic Info ---

export const getAccountInfo = async (address) => {
  const code = await (await fetch("/scripts/basic/get_account_info.cdc")).text()

  const result = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  })

  return result
}

// --- Keys ---

export const getKeys = async (address) => {
  const accountInfo = await fcl.send([fcl.getAccount(fcl.sansPrefix(address))])
  return accountInfo.account.keys.sort((a, b) => a.keyIndex - b.keyIndex)
}

// -- Contracts --

export const getContractNames = async (address) => {
  const code = await (await fetch("/scripts/contract/get_contract_names.cdc")).text()


  const names = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  })

  const uniqueNames = [...new Set(names)];

  return uniqueNames
}

// --- Domains ---

export const getDefaultDomainsOfAddress = async (address) => {
  const code = await (await fetch("/scripts/domain/get_default_domains_of_address.cdc")).text()

  const domains = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  })

  return domains
}

export const getAddressOfDomain = async (domain) => {
  const comps = domain.split(".")
  const name = comps[0]
  const root = comps[1]

  const code = await (await fetch("/scripts/domain/get_address_of_domain.cdc")).text()

  const address = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(name, t.String),
      arg(root, t.String),
    ]
  })

  return address
}

// --- Collections ---

export const getNftMetadataViews = async (address, storagePathID, tokenID) => {
  let code
  if (publicConfig.chainEnv == 'emulator') {
    code = await (await fetch("/scripts/collection/get_nft_metadata_views_emulator.cdc")).text()
  } else {
    code = await (await fetch("/scripts/collection/get_nft_metadata_views.cdc")).text()
  }

  const metadata = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(storagePathID, t.String),
      arg(tokenID, t.UInt64)
    ]
  })

  return metadata
}

export const getNftViews = async (address, storagePathID, tokenIDs) => {
  const ids = tokenIDs.map((id) => `${id}`)
  let code
  if (publicConfig.chainEnv == "emulator") {
    code = await (await fetch("/scripts/collection/get_nft_displays_emulator.cdc")).text()
  } else {
    code = await (await fetch("/scripts/collection/get_nft_displays.cdc")).text()
  }

  const displays = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(storagePathID, t.String),
      arg(ids, t.Array(t.UInt64))
    ]
  })

  console.log(displays)
  return displays
}

export const bulkGetNftViews = async (address, collection, limit, offset) => {
  const totalTokenIDs = collection.tokenIDs
  const tokenIDs = totalTokenIDs.slice(offset, offset + limit)

  const groups = splitList(tokenIDs, 20)
  const promises = groups.map((group) => {
    return getNftViews(address, collection.path.replace("/storage/", ""), group)
  })
  const displayGroups = await Promise.all(promises)
  const displays = displayGroups.reduce((acc, current) => {
    return Object.assign(acc, current)
  }, {})

  return displays
}

// --- NFT Catalog ---

export const bulkGetNftCatalog = async () => {
  const collectionIdentifiers = await getCollectionIdentifiers()
  const groups = splitList(collectionIdentifiers, 50)
  const promises = groups.map((group) => {
    return getNftCatalogByCollectionIDs(group)
  })

  const itemGroups = await Promise.all(promises)
  const items = itemGroups.reduce((acc, current) => {
    return Object.assign(acc, current)
  }, {})
  return items
}

export const getNftCatalogByCollectionIDs = async (collectionIDs) => {
  const code = await (await fetch("/scripts/collection/get_nft_catalog_by_collection_ids.cdc")).text()

  const catalogs = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(collectionIDs, t.Array(t.String))
    ]
  })

  return catalogs
}

const getCollectionIdentifiers = async () => {
  const typeData = await getCatalogTypeData()

  const collectionData = Object.values(typeData)
  const collectionIdentifiers = []
  for (let i = 0; i < collectionData.length; i++) {
    const data = collectionData[i]
    let collectionIDs = Object.keys(Object.assign({}, data))
    if (collectionIDs.length > 0) {
      collectionIdentifiers.push(collectionIDs[0])
    }
  }
  return collectionIdentifiers
}

const getCatalogTypeData = async () => {
  const code = await (await fetch("/scripts/collection/get_catalog_type_data.cdc")).text()

  const typeData = await fcl.query({
    cadence: code
  })

  return typeData
}

// --- Storage Items ---

export const bulkGetStoredItems = async (address) => {
  const paths = await getStoragePaths(address)
  const groups = splitList(paths.map((p) => p.identifier), 30)
  const promises = groups.map((group) => {
    return getStoredItems(address, group)
  })

  const itemGroups = await Promise.all(promises)
  const items = itemGroups.reduce((acc, curr) => {
    return acc.concat(curr)
  }, [])
  return items
}

export const getStoredItems = async (address, paths) => {
  const code = await (await fetch("/scripts/storage/get_stored_items.cdc")).text()
  const filteredPaths = paths.filter((item) =>
    item !== "BnGNFTCollection" && item !== "RacingTimeCollection" && item !== "FuseCollectiveCollection" && item !== "ARTIFACTV2Collection"
  )

  const items = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(filteredPaths, t.Array(t.String))
    ]
  })

  return items
}

const getStoragePaths = async (address) => {
  let code = await (await fetch("/scripts/storage/get_storage_paths.cdc")).text()
  code = code.replace("__OUTDATED_PATHS__", outdatedPaths(publicConfig.chainEnv).storage)

  const paths = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  })

  return paths
}

export const getStoredStruct = async (address, path) => {
  const pathIdentifier = path.replace("/storage/", "")

  const code = await (await fetch("/scripts/storage/get_stored_struct.cdc")).text()

  try {
    const response = await fcl.send([
      fcl.script(code),
      fcl.args([
        fcl.arg(address, t.Address),
        fcl.arg(pathIdentifier, t.String)
      ])
    ])
    const result = cadenceValueToDict(response.encodedData)
    return result
  } catch (e) {
    console.log("getStoredResource Error", e)
    return {}
  }
}


export const getStoredResource = async (address, path) => {
  const pathIdentifier = path.replace("/storage/", "")

  const code = await (await fetch("/scripts/storage/get_stored_resource.cdc")).text()

  try {
    const response = await fcl.send([
      fcl.script(code),
      fcl.args([
        fcl.arg(address, t.Address),
        fcl.arg(pathIdentifier, t.String)
      ])
    ])
    const result = cadenceValueToDict(response.encodedData)
    return result
  } catch (e) {
    console.log("getStoredResource Error", e)
    return {}
  }
}


// --- Public Items ---

export const bulkGetPublicItems = async (address) => {
  const paths = await getPublicPaths(address)
  const groups = splitList(paths, 50)
  const promises = groups.map((group) => {
    return getPublicItems(address, group)
  })

  const itemGroups = await Promise.all(promises)
  const items = itemGroups.reduce((acc, curr) => {
    return acc.concat(curr)
  }, [])
  return items
}

export const getPublicItems = async (address, paths) => {
  const pathMap = paths.reduce((acc, path) => {
    const p = { key: `/${path.domain}/${path.identifier}`, value: true }
    acc.push(p)
    return acc
  }, [])

  const code = await (await fetch("/scripts/storage/get_public_items.cdc")).text()

  const items = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(pathMap, t.Dictionary({ key: t.String, value: t.Bool }))
    ]
  })

  return items
}

// A workaround method
export const getPublicItem = async (address, paths) => {
  const pathMap = paths.reduce((acc, path) => {
    const p = { key: `/${path.domain}/${path.identifier}`, value: true }
    acc.push(p)
    return acc
  }, [])

  const code = await (await fetch("/scripts/storage/get_public_items.cdc")).text()

  const items = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(pathMap, t.Dictionary({ key: t.String, value: t.Bool }))
    ]
  })

  return items
}

export const getBasicPublicItems = async (address) => {
  let code = await (await fetch("/scripts/storage/get_basic_public_items.cdc")).text()
  code = code.replace("__OUTDATED_PATHS__", outdatedPaths(publicConfig.chainEnv).public)

  const items = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  })

  return items
}

export const getPublicPaths = async (address) => {
  let code = await (await fetch("/scripts/storage/get_public_paths.cdc")).text()
  code = code.replace("__OUTDATED_PATHS__", outdatedPaths(publicConfig.chainEnv).public)

  const paths = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  })

  return paths
}

// --- Private Items ---

export const bulkGetPrivateItems = async (address) => {
  const paths = await getPrivatePaths(address)
  const groups = splitList(paths, 50)
  const promises = groups.map((group) => {
    return getPrivateItems(address, group)
  })

  const itemGroups = await Promise.all(promises)
  const items = itemGroups.reduce((acc, curr) => {
    return acc.concat(curr)
  }, [])
  return items
}

export const getPrivateItems = async (address, paths) => {
  const pathMap = paths.reduce((acc, path) => {
    const p = { key: `/${path.domain}/${path.identifier}`, value: true }
    acc.push(p)
    return acc
  }, [])

  const code = await (await fetch("/scripts/storage/get_private_items.cdc")).text()

  const items = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(pathMap, t.Dictionary({ key: t.String, value: t.Bool }))
    ]
  })

  return items
}

export const getPrivatePaths = async (address) => {
  let code = await (await fetch("/scripts/storage/get_private_paths.cdc")).text()
  code = code.replace("__OUTDATED_PATHS__", outdatedPaths(publicConfig.chainEnv).private)

  const paths = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address)
    ]
  })

  return paths
}
