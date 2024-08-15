import DomainUtils from 0xFlowbox

access(all) fun main(address: Address): {String: String} {
  return DomainUtils.getDefaultDomainsOfAddress(address)
}