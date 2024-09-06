import FlowDomainUtils from 0xFlowbox

access(all) fun main(name: String, root: String): Address? {
  return FlowDomainUtils.getAddressOfDomain(name: name, root: root)
}