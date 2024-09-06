import FlowDomainUtils from 0xFlowbox

access(all) fun main(address: Address): {String: String} {
  return FlowDomainUtils.getDefaultDomainsOfAddress(address)
}