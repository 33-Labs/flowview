import DomainUtils from 0xFlowbox

pub fun main(name: String, root: String): Address? {
  return DomainUtils.getAddressOfDomain(name: name, root: root)
}