import { useRouter } from "next/router"
import Layout from "../../../components/common/Layout"
import { huntStorage, huntPrivate, huntPublic } from "../../../flow/bug_hunter"
import { getDelegatorInfo, getEpochMetadata, getNodeInfo, getStakingInfo } from "../../../flow/staking_scripts"

export default function Analyzer() {
  const router = useRouter()
  const { account } = router.query

  const getNodeIDs = (collectorClusters) => {
    let totalNodeIDs = []
    for (let i = 0; i < collectorClusters.length; i++) {
      let cluster = collectorClusters[i]
      let nodeWeights = cluster.nodeWeights
      let nodeIDs = Object.keys(nodeWeights)
      totalNodeIDs.push(...nodeIDs)
    }
    return totalNodeIDs
  } 

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div className="flex flex-col gap-x-2">
        <button
            onClick={async () => {
              let info = await getStakingInfo("0x0a1381bc9aa8b362")
            }}>
            Staking Info
          </button>
        <button
            onClick={async () => {
              let info = await getDelegatorInfo("41f82d558dad936f3b3875d08d0cbdd4045a4c7024292e195e1df1066c5197fe", "1")
            }}>
            Delegator Info
          </button>
          <button
            onClick={async () => {
              let epochMetadata = await getEpochMetadata(55)
              let totalNodeIDs = getNodeIDs(epochMetadata.collectorClusters)
              for (let i = 0; i < totalNodeIDs.length; i++) {
                let nodeID = totalNodeIDs[i]
                let nodeInfo = await getNodeInfo(nodeID)
                if (parseInt(nodeInfo.delegatorIDCounter) == 1) {
                  break
                }
              }
            }}>
            Staking
          </button>
          <button
            onClick={async () => {
              await huntStorage(account)
            }}>
            Analyze Storage
          </button>
          <button
            onClick={async () => {
              await huntPublic(account)
            }}>
            Analyze Public
          </button>
          <button
            onClick={async () => {
              await huntPrivate(account)
            }}>
            Analyze Private
          </button>
        </div>

      </Layout>
    </div>
  )
}