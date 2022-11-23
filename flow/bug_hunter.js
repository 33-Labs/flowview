import publicConfig from "../publicConfig"
import * as fcl from "@onflow/fcl"

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

export const hunt = async (address) => {
  const paths = await getStoragePaths(address)
  console.log(paths)
  const bugs = []
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    try {
      const type = await getTypeOfStoragePath(address, path)
    } catch (e) {
      bugs.push({
        path: path,
        error: e
      })
    }
  }
  console.log(bugs)
}
