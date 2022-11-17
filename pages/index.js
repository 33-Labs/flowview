import Image from 'next/image'
import { useRecoilState } from "recoil"
import Layout from '../components/common/Layout'
import {
  transactionInProgressState,
} from "../lib/atoms"

const SearchPlaceholder = "Search Account"

export default function Home() {
  const [transactionInProgress,] = useRecoilState(transactionInProgressState)

  return (
    <div className="container mx-auto max-w-7xl min-w-[380px] px-6">
      <div>
        <label></label>
        <input
          type="text"
          name="search"
          id="search"
          disabled={transactionInProgress}
          required
          className="block w-full font-flow text-lg rounded-2xl px-3 py-2
            border border-emerald focus:border-emerald-dark
            outline-0 focus:outline-2 focus:outline-emerald-dark 
            placeholder:text-gray-300"
          placeholder={SearchPlaceholder}
          onChange={(event) => {
            console.log("ONCHANGE", event.value)
          }}
          onKeyUp={(event) => {
            console.log("ONKEYUP", event.key)
          }}
        />
      </div>
    </div>
  )
}
