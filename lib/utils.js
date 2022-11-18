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