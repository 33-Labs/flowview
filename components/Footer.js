import * as fcl from "@onflow/fcl"
import Image from "next/image"
import { configureForNetwork, getNetwork, getNetworkByName, Network, NetworkNames } from "../flow/config"
import { use, useEffect, useState } from "react"
import { useRouter } from "next/router"

const FLOW_NETWORK = "flowNetwork"

export default function Footer() {
  const [network, setNetwork] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const _network = localStorage.getItem(FLOW_NETWORK) || Network.Mainnet.name
    setNetwork(_network)
    configureForNetwork(_network)
  }, [])

  const switchNetwork = (network) => {
    if (network != null) {
      fcl.unauthenticate()
      configureForNetwork(network)
      localStorage.setItem(FLOW_NETWORK, network);
      localStorage.setItem("shouldDoConnectionJump", "YES")
      router.push("/")
    }
  }

  return (
    <footer className="m-auto mt-60 max-w-[920px] flex flex-1 justify-center items-center py-8 border-t border-solid box-border">
      <div className="flex flex-col gap-y-2 items-center">
      <div
          className="flex gap-x-2 items-center font-flow text-sm mb-5 -mt-3"
        >
          <label>
            Current Network
          </label>
          <button
            type="button" 
            className={`rounded-2xl px-2 py-1 bg-drizzle hover:bg-drizzle-dark font-semibold`}
            onClick={() => {
              if (!network || network === Network.Mainnet.name) {
                setNetwork(Network.Testnet.name)
                switchNetwork(Network.Testnet.name)
              } else if (network === Network.Testnet.name) {
                setNetwork(Network.Emulator.name)
                switchNetwork(Network.Emulator.name)
              } else if (network === Network.Emulator.name) {
                setNetwork(Network.Mainnet.name)
                switchNetwork(Network.Mainnet.name)
              }
            }}
          >
            {network}
          </button>
        </div>
        <div className="flex gap-x-2">
          <a href="https://github.com/33-Labs/flowview"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="min-w-[20px]">
              <Image src="/github.png" alt="" width={20} height={20} />
            </div>
          </a>
          <a href="https://lanford33.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="min-w-[20px]">
              <Image src="/33.png" alt="" width={20} height={20} />
            </div>
          </a>
          <a href="https://twitter.com/33_labs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="w-[20px] h-[20px] relative">
              <Image className="object-contain" src="/twitter.png" alt="" fill sizes="10vw" />
            </div>
          </a>
          <a href="https://bayou33.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="min-w-[20px]">
              <Image src="/bayou.png" alt="" width={20} height={20} />
            </div>
          </a>
          <a href="https://drizzle33.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="min-w-[20px]">
              <Image src="/drizzle.png" alt="" width={20} height={20} priority />
            </div>
          </a>
        </div>
        <a
          href="https://github.com/33-Labs"
          target="_blank"
          rel="noopener noreferrer"
          className="font-flow text-sm whitespace-pre"
        >
          Made by <span className="underline font-bold decoration-drizzle decoration-2">33Labs</span> with ❤️
        </a>
        <a
          href="https://discord.gg/emeraldcity"
          target="_blank"
          rel="noopener noreferrer"
          className="font-flow text-sm whitespace-pre"
        >
          Get support on <span className="underline font-bold decoration-drizzle decoration-2">Emerald City DAO</span>
        </a>
      </div>
    </footer>
  )
}