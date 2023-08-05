import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"
import { getPublicPaths } from "./scripts"

export const getStoragePaths = async (address) => {
  const code = `
  pub fun main(address: Address): [String] {
    let account = getAuthAccount(address)
    let paths: [String] = []
    account.forEachStored(fun (path: StoragePath, type: Type): Bool {
        paths.append(path.toString())
        return true
    })
    return paths
  }
  `

  const paths = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
    ]
  }) 

  return paths
}

export const getPrivatePaths = async (address) => {
  const code = `
  pub fun main(address: Address): [String] {
    let account = getAuthAccount(address)
    let paths: [String] = []
    account.forEachPrivate(fun (path: PrivatePath, type: Type): Bool {
        paths.append(path.toString())
        return true
    })
    return paths
  }
  `

  const paths = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
    ]
  }) 

  return paths
}

export const getTypeOfPrivatePath = async (address, path) => {
  const pathIdentifier = path.replace("/private/", "")

  const code = `
  pub fun main(address: Address, pathIdentifier: String): String? {
    let account = getAuthAccount(address)
    let path: PrivatePath = PrivatePath(identifier: pathIdentifier)!
    let target = account.getLinkTarget(path)
    var targetPath: String? = nil
    if let t = target {
      targetPath = t.toString()
    }
    return targetPath
  }
  `

  const type = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(pathIdentifier, t.String)
    ]
  }) 

  return type
}

export const getTypeOfStoragePath = async (address, path) => {
  const pathIdentifier = path.replace("/storage/", "")

  const code = `
  pub fun main(address: Address, pathIdentifier: String): Type? {
    let account = getAuthAccount(address)
    let path: StoragePath = StoragePath(identifier: pathIdentifier)!
    return account.type(at: path)
  }
  `

  const type = await fcl.query({
    cadence: code,
    args: (arg, t) => [
      arg(address, t.Address),
      arg(pathIdentifier, t.String)
    ]
  }) 

  return type
}

// export const hunt2 = async (address) => {
//   const paths = await getStoragePaths(address)
//   const bugs = []
//   const promises = paths.map((path) => {
//     const result = getTypeOfStoragePath(address, path).catch((error) => null)
//     return result
//   })
//   while (promises.length) {
//     // 5 at a time
//     const result = await Promise.all( promises.splice(0, 5) )
//     console.log(result)
//   }
// }

export const huntStorage = async (address) => {
  const paths = await getStoragePaths(address)
  const bugs = []
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    try {
      await getTypeOfStoragePath(address, path)
    } catch (e) {
      bugs.push({
        path: path,
        error: e
      })
    }
  }
  const bugPaths = {}
  for (let i = 0; i < bugs.length; i++) {
    let bug = bugs[i]
    bugPaths[bug.path] = true
  }

  const publicPaths = await getPublicPaths(address)
  const bugPublicPaths = {}
  for (let i = 0; i < publicPaths.length; i++) {
    let publicPath = publicPaths[i]
    let firstFiveChars = publicPath.identifier.slice(0, 3)
    for (let j = 0; j < bugs.length; j++) {
      let bugPath = bugs[j].path
      if (bugPath.includes(`/storage/${firstFiveChars}`)) {
        bugPublicPaths[`/public/${publicPath.identifier}`] = true
        break
      }
    }
  }
  console.log("bugPublicPaths:", bugPublicPaths)

  const privatePaths = await getPrivatePaths(address)
  const bugPrivatePaths = {}
  for (let i = 0; i < privatePaths.length; i++) {
    let privatePath = privatePaths[i]
    let firstFiveChars = privatePath.identifier.slice(0, 3)
    for (let j = 0; j < bugs.length; j++) {
      let bugPath = bugs[j].path
      if (bugPath.includes(`/storage/${firstFiveChars}`)) {
        bugPrivatePaths[`/private/${privatePath.identifier}`] = true
        break
      }
    }
  }
  console.log("bugPrivatePaths:", bugPrivatePaths)
}

export const huntPrivate = async (address) => {
  const paths = await getPrivatePaths(address)
  console.log(paths)
}

export const huntPublic = async (address) => {
  const paths = await getPublicPaths(address)
  console.log(paths)
}