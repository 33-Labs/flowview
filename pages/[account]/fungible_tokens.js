import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { SpinnerCircular } from "spinners-react"
import useSWR from "swr"
import TokenList from "../../components/TokenList"
import Layout from "../../components/common/Layout"
import { getFTBalances, getItems } from "../../flow/scripts"
import { isValidFlowAddress, getResourceType } from "../../lib/utils"
import { TokenListProvider, ENV, Strategy } from 'flow-native-token-registry'
import Custom404 from "./404"
import publicConfig from "../../publicConfig"

const tokenBalancesFetcher = async (funcName, address) => {
  return await getFTBalances(address)
}

const formatBalancesData = (balances) => {
  return balances.map((data) => {
    const resource = getResourceType(data.type)
    const contract = resource.replace(".Vault", "")
    return {
      balance: data.balance,
      contract: contract
    }
  })
}

export default function FungibleTokens(props) {
  const router = useRouter()
  const { account } = router.query

  const [tokens, setTokens] = useState([])
  const [registryTokenList, setRegistryTokenList] = useState(null)

  const { data: balancesData, error: balancesError } = useSWR(
    account && isValidFlowAddress(account) ? ["tokenBalancesFetcher", account] : null, tokenBalancesFetcher
  )

  useEffect(() => {
    let env = ENV.Mainnet
    if (publicConfig.chainEnv == 'testnet') {
      env = ENV.Testnet
    }

    new TokenListProvider().resolve(Strategy.GitHub, env).then(tokens => {
      const tokenList = tokens.getList().map((token) => {
        token.id = `${token.address.replace("0x", "A.")}.${token.contractName}`
        return token
      })
      setRegistryTokenList(tokenList)
    })
  }, [setRegistryTokenList])

  useEffect(() => {
    if (balancesData && balancesData.length > 0 && registryTokenList.length > 0) {
      const tokensInfo = formatBalancesData(balancesData)
      console.log("HELLO", tokensInfo)
      for (let i = 0; i < tokensInfo.length; i++) {
        const token = tokensInfo[i]
        const registryInfo = registryTokenList.find((t) => t.id == token.contract)
        console.log("registryInfo", registryInfo)
        if (registryInfo) {
          token.symbol = registryInfo.symbol
          token.logoURL = registryInfo.logoURI
        }
      }

      const info = tokensInfo.map((t) => {
        let order = t.symbol
        // Make sure FLOW is the first one
        if (t.symbol == "FLOW") order = ""
        return {...t, order: order }
      }).sort((a, b) => a.order.localeCompare(b.order))
      setTokens(info)
    }
  }, [balancesData, registryTokenList])

  if (!account) {
    return <></>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showTokens = () => {
    if (!balancesData || !registryTokenList) {
      return (
        <div className="flex mt-10 h-[200px] justify-center">
          <SpinnerCircular size={50} thickness={180} speed={100} color="#38E8C6" secondaryColor="#e2e8f0" />
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