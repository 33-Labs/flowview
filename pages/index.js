import Image from 'next/image'
import { useEffect, useState } from 'react'
import SearchBar from '../components/common/SearchBar'
import { useRecoilState } from "recoil"
import { networkState } from "../lib/atoms"
import { Network } from '../flow/config'

export default function Home() {
  const [network, ] = useRecoilState(networkState)
  const [topGap, setTopGap] = useState("mt-20")
  useEffect(() => {
    if (network == Network.Emulator.name) {
      setTopGap("mt-0")
    } else {
      setTopGap("mt-20")
    }
  }, [network])

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-6">
      <div className={`flex flex-col items-center ${topGap} mb-20 gap-y-12 justify-stretch`}>
        {
          network == Network.Emulator.name ? 
          <div className='flex flex-col px-3 py-2 bg-drizzle-light rounded-xl text-sm'>
            <label>Please make sure that:</label>
            <label>1. The emulator started with <code className="text-xs">--contracts</code></label>
            <label>2. The port of emulator is 8888</label>
            <label>3. The port of dev-wallet is 8701</label>
          </div> : null
        }
        <div className="flex gap-x-2 sm:gap-x-4 items-center">
          <div className="w-10 sm:w-16 aspect-square relative">
            <Image src="/logo.png" alt="" fill sizes="33vw" priority={true} />
          </div>
          <label className="font-flow font-bold text-2xl sm:text-4xl">
            Explore Flow Accounts
          </label>
        </div>
        <SearchBar classes={"px-4 min-w-[340px] max-w-[480px] w-full"} />
      </div>
    </div>
  )
}
