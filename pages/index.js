import Image from 'next/image'
import SearchBar from '../components/common/SearchBar'

export default function Home() {

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-6">
      <div className="flex flex-col items-center mt-20 mb-20 gap-y-12 justify-stretch">
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
