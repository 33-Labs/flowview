import Image from "next/image"

export default function Footer() {
  return (
    <footer className="m-auto mt-60 max-w-[920px] flex flex-1 justify-center items-center py-6 border-t border-solid box-border">
      <div className="flex flex-col gap-y-2 items-center">
        <div className="flex gap-x-2">
          <a href="https://www.ecdao.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="min-w-[24px]">
              <Image src="/ecdao.png" alt="" width={24} height={24} />
            </div>
          </a>
          <a href="https://github.com/emerald-dao/link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="min-w-[23px]">
              <Image src="/github.png" alt="" width={23} height={23} />
            </div>
          </a>
        </div>

        <a
          href="https://discord.com/invite/emeraldcity"
          target="_blank"
          rel="noopener noreferrer"
          className="font-flow text-sm whitespace-pre"
        >
          Created by <span className="underline font-bold decoration-emerald decoration-2">Emerald City DAO</span>
        </a>
        <label className="font-flow text-sm whitespace-pre">2022. All rights reserved.</label>
      </div>

    </footer>
  )
}