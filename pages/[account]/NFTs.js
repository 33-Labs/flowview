import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import TokenList from "../../components/TokenList"
import Layout from "../../components/common/Layout"
import { getFTBalances, getItems, getNfts, getNftCatalog, getNftsWithIDs, getCatalogTypeData, getNFTsWithCollectionID } from "../../flow/scripts"
import { isValidFlowAddress, getResourceType, getContract } from "../../lib/utils"
import { TokenListProvider, ENV, Strategy } from 'flow-native-token-registry'
import Custom404 from "./404"
import publicConfig from "../../publicConfig"
import Spinner from "../../components/common/Spinner"
import NFTList from "../../components/NFTList"

const getNftsWithNftType = (nfts) => {
  return nfts.map((n) => {
    let collection = getResourceType(n.type)
    let contract = getContract(collection)
    let nftType = `${contract}.NFT`
    return { ...n, nftType: nftType, contract: contract }
  }).filter((n) => n.nftType)
}

const catalogFetcher = async (funcName, nfts) => {
  return await getNftCatalog(nfts)
}

const nftsFetcher = async (funcName, address) => {
  const nfts = await getNfts(address)
  const nftsWithIDs = (await getNftsWithIDs(address, nfts)).filter((n) => n.nftIDs.length > 0)

  const nftsWithNftType = getNftsWithNftType(nftsWithIDs)
  const typeData = await getCatalogTypeData()
  return getNFTsWithCollectionID(nftsWithNftType, typeData).sort((a, b) => a.path.localeCompare(b.path))
}

export default function NFTs(props) {
  const router = useRouter()
  const { account } = router.query

  const [nfts, setNFTs] = useState(null)

  const { data: nftsData, error: nftsError } = useSWR(
    account && isValidFlowAddress(account) ? ["nftsFetcher", account] : null, nftsFetcher
  )
  useEffect(() => {
    if (nftsData) {
      setNFTs(nftsData)
    }
  }, [nftsData])

  const { data: catalogData, error: catalogError } = useSWR(
    account && isValidFlowAddress(account) && nfts ? ["catalogFetcher", nfts] : null, catalogFetcher)

  useEffect(() => {
    if (catalogData && nfts) {
      const nftsWithCatalog = nfts.map((n) => {
        let catalog = null
        if (n.collectionIdentifier) {
          catalog = catalogData[n.collectionIdentifier]
        }
        return {...n, catalog: catalog}
      })
      setNFTs(nftsWithCatalog)
    }
  }, [catalogData])

  if (!account) {
    return <></>
  }

  if (!isValidFlowAddress(account)) {
    return <Custom404 title={"Account may not exist"} />
  }

  const showNfts = () => {
    if (!nfts) {
      return (
        <div className="flex mt-10 h-[200px] justify-center">
          <Spinner />
        </div>
      )
    } else {
      return (
        <NFTList nfts={nfts} />
      )
    }
  }

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-2">
      <Layout>
        {showNfts()}
      </Layout>
    </div>
  )
}