import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import useSWR from "swr"
import TokenList from "../../../components/TokenList"
import Layout from "../../../components/common/Layout"
import { getFTBalances, getItems, getNfts, getNftCatalog, getNftsWithIDs, getCatalogTypeData, getNFTsWithCollectionID } from "../../../flow/scripts"
import { isValidFlowAddress, getResourceType, getContract } from "../../../lib/utils"
import { TokenListProvider, ENV, Strategy } from 'flow-native-token-registry'
import Custom404 from "./404"
import publicConfig from "../../../publicConfig"
import Spinner from "../../../components/common/Spinner"
import NFTList from "../../../components/NFTList"
import NFTView from "../../../components/common/NFTView"
import { useRecoilState } from "recoil"
import { publicItemsState } from "../../../lib/atoms"

const getCollectionsWithNftType = (collections) => {
  return collections.map((c) => {
    let collection = getResourceType(c.type)
    let contract = c.path.replace("/public/", "")
    let contractName = contract
    let nftType = contract
    if (collection != "AnyResource") {
      contract = getContract(collection)
      let comps = contract.split(".")
      contractName = comps[comps.length - 1]
      nftType = `${contract}.NFT`
    }

    return { ...c, nftType: nftType, contract: contract, contractName: contractName }
  }).filter((c) => c.nftType)
}

const catalogFetcher = async (funcName, nfts) => {
  return await getNftCatalog(nfts)
}

// const nftsFetcher = async (funcName, address) => {
//   const nfts = await getNfts(address)
//   const nftsWithIDs = (await getNftsWithIDs(address, nfts)).filter((n) => n.nftIDs.length > 0)
//   const nftsWithNftType = getNftsWithNftType(nftsWithIDs)
//   const typeData = await getCatalogTypeData()
//   return getNFTsWithCollectionID(nftsWithNftType, typeData).sort((a, b) => a.path.localeCompare(b.path))
// }

export default function NFTs(props) {
  const router = useRouter()
  const { account } = router.query

  const [nfts, setNFTs] = useState(null)
  const [collectionData, setCollectionData] = useState(null)
  return (<></>)

  // const { data: nftsData, error: nftsError } = useSWR(
  //   account && isValidFlowAddress(account) ? ["nftsFetcher", account] : null, nftsFetcher
  // )

  useEffect(() => {
    if (account && isValidFlowAddress(account)) {
      if (!publicItems) {
        bulkGetPublicItems(account).then((items) => {
          const orderedItems = items.sort((a, b) => a.path.localeCompare(b.path))
          setPublicItems(orderedItems)
        })
      } else {
        setCollectionData(publicItems.filter((item) => item.isCollectionCap))
      }
    }
  }, [publicItems, account])


  useEffect(() => {
    if (collectionData) {
      const collectionsWithNftType = getCollectionsWithNftType(collectionData)
      const typeData = await getCatalogTypeData()
      return getNFTsWithCollectionID(nftsWithNftType, typeData).sort((a, b) => a.path.localeCompare(b.path))
      setNFTs(nftsData)
    }
  }, [collectionData])

  const { data: catalogData, error: catalogError } = useSWR(
    account && isValidFlowAddress(account) && nfts ? ["catalogFetcher", nfts] : null, catalogFetcher)

  useEffect(() => {
    if (catalogData && nfts) {
      const nftsWithCatalog = nfts.map((n) => {
        let catalog = null
        if (n.collectionIdentifier) {
          catalog = catalogData[n.collectionIdentifier]
        }
        return { ...n, catalog: catalog }
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
        <div className="flex flex-col gap-y-4">
          <div className="sm:flex-auto">
            <div className="flex gap-x-1 pr-8 justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {`Collections (${nfts.length})`}
              </h1>
              <label className={`cursor-pointer text-black bg-drizzle hover:bg-drizzle-dark px-3 py-2 text-sm rounded-2xl font-semibold shrink-0`}>
                <a href={`${publicConfig.drizzleURL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create raffle
                </a>
              </label>
            </div>
          </div>
          {
            nfts.length > 0 ?
              nfts.map((nft, index) => {
                return (
                  <NFTView nft={nft} key={`${nft.path}_${index}`} />
                )
              }) :
              <div className="flex mt-10 h-[70px] text-gray-400 text-base justify-center">
                Nothing found
              </div>
          }
        </div>
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