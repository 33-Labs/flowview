import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import TokenList from "../../../components/TokenList"
import Layout from "../../../components/common/Layout"
import { bulkGetPublicItems } from "../../../flow/scripts"
import { isValidFlowAddress, getResourceType } from "../../../lib/utils"
import { TokenListProvider, ENV, Strategy } from 'flow-native-token-registry'
import Custom404 from "./404"
import publicConfig from "../../../publicConfig"
import Spinner from "../../../components/common/Spinner"
import { useRecoilState } from "recoil"
import { currentPublicItemsState, tokenRegistryState } from "../../../lib/atoms"

const formatBalancesData = (balances) => {
  return balances.map((data) => {
    const resource = getResourceType(data.type)
    const contract = resource.replace(".Vault", "")
    let comps = contract.split(".")
    let contractName = comps[comps.length - 1]
    return {
      balance: data.balance,
      contract: contract,
      contractName: contractName
    }
  })
}

export default function FungibleTokens(props) {
  const router = useRouter()
  const { account } = router.query

  const [tokens, setTokens] = useState([])
  const [currentPublicItems, setCurrentPublicItems] = useRecoilState(currentPublicItemsState)
  const [tokenRegistry, setTokenRegistry] = useRecoilState(tokenRegistryState)
  const [balanceData, setBalanceData] = useState(null)

  useEffect(() => {
    if (account && isValidFlowAddress(account)) {
      if (!currentPublicItems || (currentPublicItems.length > 0 && currentPublicItems[0].address != account)) {
        setCurrentPublicItems(null)
        bulkGetPublicItems(account).then((items) => {
          const orderedItems = items.sort((a, b) => a.path.localeCompare(b.path))
          setCurrentPublicItems(orderedItems)
        })
      } else {
        setBalanceData(currentPublicItems.filter((item) => item.isBalanceCap))
      }
    }
  }, [currentPublicItems, account])

  useEffect(() => {
    if (tokenRegistry) return
    let env = ENV.Mainnet
    if (publicConfig.chainEnv == 'testnet') {
      env = ENV.Testnet
    }

    new TokenListProvider().resolve(Strategy.GitHub, env).then(tokens => {
      const tokenList = tokens.getList().map((token) => {
        token.id = `${token.address.replace("0x", "A.")}.${token.contractName}`
        return token
      })
      setTokenRegistry(tokenList)
    })
  }, [setTokenRegistry, tokenRegistry])

  useEffect(() => {
    if (balanceData && tokenRegistry) {
      const tokensInfo = formatBalancesData(balanceData)
      for (let i = 0; i < tokensInfo.length; i++) {
        const token = tokensInfo[i]
        const registryInfo = tokenRegistry.find((t) => t.id == token.contract)
        if (registryInfo) {
          token.symbol = registryInfo.symbol
          token.logoURL = registryInfo.logoURI
        }
      }

      const info = tokensInfo.map((t) => {
        let order = t.symbol || t.contractName
        // Make sure FLOW is the first one
        if (t.symbol == "FLOW") order = ""
        return { ...t, order: order }
      }).sort((a, b) => a.order.localeCompare(b.order))
      setTokens(info)
    }
  }, [balanceData, tokenRegistry])

  if (!account) {
    return <></>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showTokens = () => {
    if (!balanceData || !tokenRegistry) {
      return (
        <div className="flex w-full mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    } else {
      return (
        <TokenList tokens={tokens} />
      )
    }
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        {showTokens()}
      </Layout>
    </div>
  )
}