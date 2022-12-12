import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import TokenList from "../../../components/TokenList"
import Layout from "../../../components/common/Layout"
import { bulkGetStoredItems } from "../../../flow/scripts"
import { isValidFlowAddress, getResourceType, classNames } from "../../../lib/utils"
import { TokenListProvider, ENV, Strategy } from 'flow-native-token-registry'
import Custom404 from "./404"
import publicConfig from "../../../publicConfig"
import Spinner from "../../../components/common/Spinner"
import { useRecoilState } from "recoil"
import { currentStoredItemsState, tokenRegistryState } from "../../../lib/atoms"
import Decimal from "decimal.js"
import { Switch } from "@headlessui/react"

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

export default function FungibleToken(props) {
  const router = useRouter()
  const { account } = router.query

  const [tokens, setTokens] = useState([])
  const [hideZeroBalance, setHideZeroBalance] = useState(true)
  const [filteredTokens, setFilteredTokens] = useState(tokens)
  const [currentStoredItems, setCurrentStoredItems] = useRecoilState(currentStoredItemsState)
  const [tokenRegistry, setTokenRegistry] = useRecoilState(tokenRegistryState)
  const [balanceData, setBalanceData] = useState(null)

  useEffect(() => {
    if (hideZeroBalance) {
      setFilteredTokens(tokens.filter((t) => !(new Decimal(t.balance).isZero())))
    } else {
      setFilteredTokens(tokens)
    }
  }, [tokens, hideZeroBalance])

  useEffect(() => {
    if (account && isValidFlowAddress(account)) {
      if (!currentStoredItems || (currentStoredItems.length > 0 && currentStoredItems[0].address != account)) {
        setCurrentStoredItems(null)
        bulkGetStoredItems(account).then((items) => {
          const orderedItems = items.sort((a, b) => a.path.localeCompare(b.path))
          setCurrentStoredItems(orderedItems)
        })
      } else {
        setBalanceData(currentStoredItems.filter((item) => item.isVault))
      }
    }
  }, [currentStoredItems, account])

  useEffect(() => {
    if (tokenRegistry) return
    if (publicConfig.chainEnv === "emulator") {
      setTokenRegistry([])
      return
    }

    let env = ENV.Mainnet
    if (publicConfig.chainEnv === 'testnet') {
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
    return <div className="h-screen"></div>
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
        <TokenList tokens={filteredTokens} />
      )
    }
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        <div className="p-2 flex gap-x-3 justify-between flex-wrap gap-y-3">
          <div className="flex flex-col gap-y-2 sm:flex-row sm:gap-x-2 sm:items-center justify-center">
            <h1 className="shrink-0 text-xl sm:text-2xl font-bold text-gray-900">
              {`Tokens ${filteredTokens.length > 0 ? `(${filteredTokens.length})` : ""}`}
            </h1>
            <div className="flex gap-x-2 items-center">
              <label className="shrink-0 block text-gray-600 text-base font-normal font-flow">
                Hide 0 balance
              </label>
              <Switch
                checked={hideZeroBalance}
                onChange={async () => {
                  setHideZeroBalance(!hideZeroBalance)
                }}
                className={classNames(
                  hideZeroBalance ? 'bg-drizzle' : 'bg-gray-200',
                  'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-drizzle'
                )}
              >
                <span
                  aria-hidden="true"
                  className={classNames(
                    hideZeroBalance ? 'translate-x-5' : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                  )}
                />
              </Switch>
            </div>
          </div>
          <div className="hidden sm:flex sm:gap-x-1 sm:items-center">
            <label className={`cursor-pointer text-black bg-flow hover:bg-green-500 px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}>
              <a href={`${publicConfig.bayouURL}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Bulk transfer
              </a>
            </label>
            <label className={`cursor-pointer text-black bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}>
              <a href={`${publicConfig.drizzleURL}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Create airdrop
              </a>
            </label>
            <label className={`cursor-pointer text-white bg-increment hover:bg-blue-800 px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}>
              <a href={`${publicConfig.incrementURL}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Trade at Increment
              </a>
            </label>
          </div>
          <div className="w-full overflow-auto h-screen">
            {showTokens()}
          </div>
        </div>
      </Layout>
    </div>
  )
}