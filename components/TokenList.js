import Image from 'next/image'
import { getContractLink } from '../lib/utils'
import publicConfig from "../publicConfig"
import { useRecoilState } from "recoil"
import { transactionInProgressState, transactionStatusState } from '../lib/atoms'
import { addNewVault, removeVault } from '../flow/switchboard_transactions'
import { useSWRConfig } from 'swr'
import TokenView from './fungible_token/TokenView'

export default function TokenList(props) {
  const { mutate } = useSWRConfig()
  const [transactionInProgress, setTransactionInProgress] = useRecoilState(transactionInProgressState)
  const [, setTransactionStatus] = useRecoilState(transactionStatusState)

  const { tokens, switchboard, isCurrentUser, account } = props

  const inSwitchboard = (switchboard, token) => {
    if (!switchboard) return false
    for (let i = 0; i < switchboard.vaultTypes.length; i++) {
      let type = switchboard.vaultTypes[i]
      if (type.typeID.includes(token.contract)) {
        return true
      }
    }
    return false
  }

  return (
    <div>
      {tokens.length > 0 ?
        <div className="px-2 py-1 flex flex-col gap-y-3">
          {
            tokens.map((token) => {
              let newToken = Object.assign({}, token)
              newToken.inSwitchboard = inSwitchboard(switchboard, token)
              return newToken
            }).map((token, index) => {
              return <TokenView key={`ft-tokenview-${index}`} account={account} token={token} isCurrentUser={isCurrentUser} switchboard={switchboard} />
            })
          }
        </div> :
        <div className="flex mt-10 h-[70px] text-gray-400 text-base justify-center">
          Nothing found
        </div>}
    </div>
  )
}