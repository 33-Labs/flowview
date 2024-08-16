import DomainUtils from 0xFlowbox

access(all) fun main(name: String, root: String): Address? {
  return DomainUtils.getAddressOfDomain(name: name, root: root)
}