import { useRouter } from "next/router";
import publicConfig from "../../publicConfig";
import { useRecoilState } from "recoil";
import { transactionInProgressState, transactionStatusState } from "../../lib/atoms";
import { removeChildAccount } from "../../flow/hc_transactions";
import { useSWRConfig } from "swr";
import { getContractLink } from "../../lib/utils";
import Image from "next/image";

export default function TokenView(props) {
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const { mutate } = useSWRConfig()

  const router = useRouter()
  const { token, account, isCurrentUser } = props

  return (
    <div className="min-w-[500px] flex flex-col gap-y-3 p-4 shadow-md rounded-2xl bg-white">
      <div className="flex flex-col gap-y-2">

        <div className="flex gap-x-2 justify-between items-center">
          <div className="flex gap-x-2 items-center">
            <div className="h-10 w-10 flex-shrink-0 relative">
              <Image className="rounded-lg object-contain" src={token.logoURL || "/token_placeholder.png"} alt="" fill sizes="5vw" />
            </div>
            <div className="flex flex-col">
              <label className="block font-bold text-base text-gray-900 break-words max-w-[300px] min-w-[60px]">{token.symbol || token.contractName}</label>
              <div className="cursor-pointer text-xs text-black decoration-drizzle decoration-2 underline">
                <a href={getContractLink(token.contract)}
                  target="_blank"
                  rel="noopener noreferrer">
                  {token.contract}
                </a>
              </div>
            </div>
          </div>
          <label className="block font-bold text-base text-gray-900 break-words max-w-[300px] min-w-[60px]">{token.balance}</label> 
        </div>
      </div>
    </div>
  )
}