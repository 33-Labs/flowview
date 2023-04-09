import DomainUtils from 0xFlowbox

pub fun main(address: Address): {String: String} {
  return DomainUtils.getDefaultDomainsOfAddress(address)
}