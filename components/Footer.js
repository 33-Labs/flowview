import Image from "next/image"

export default function Footer() {
  return (
    <footer className="m-auto mt-60 max-w-[920px] flex flex-1 justify-center items-center py-8 border-t border-solid box-border">
      <div className="flex flex-col gap-y-2 items-center">
        <div className="flex gap-x-2 mb-8">
          <a href="https://flowview.app"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-[72px] text-center font-bold text-xs px-2 py-1 leading-5 rounded-full bg-drizzle text-black`}
          >
            {"mainnet"}
          </a>

          <a href="https://testnet.flowview.app"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-[72px] text-center font-bold text-xs px-2 py-1 leading-5 rounded-full bg-emerald-300 text-black`}
          >
            {"testnet"}
          </a>

          <a href="https://emulator.flowview.app"
            target="_blank"
            rel="noopener noreferrer"
            className={`w-[72px] text-center font-bold text-xs px-2 py-1 leading-5 rounded-full bg-yellow-300 text-black`}
          >
            {"emulator"}
          </a>
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
              <Image className="object-contain" src="/twitter.png" alt="" fill sizes="5vw" />
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
              <Image src="/drizzle.png" alt="" width={20} height={20} />
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